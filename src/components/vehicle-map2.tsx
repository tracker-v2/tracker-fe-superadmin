import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Vehicle } from "@/types/types";
import { useEffect, useMemo } from "react";
import { useVehicleStore } from "@/store/useVehicleStore";
import { useRightbarStore } from "@/store/useRightStore";
import { FitBoundsToVehicles } from "./focus-vehicle";

const FlyToMarker = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 16);
  }, [lat, lng, map]);

  return null;
};

interface VehicleMapProps {
  vehicleLocations: Vehicle[];
}

// Normalize status to handle both formats
const normalizeStatus = (status: string): "on" | "off" | "idle" | "default" => {
  const statusUpper = status.toUpperCase();
  if (statusUpper === "OPERATING" || statusUpper === "ACTIVE") return "on";
  if (statusUpper === "STOPPED" || statusUpper === "INACTIVE") return "off";
  if (statusUpper === "IDLE") return "idle";
  return "default";
};

// Get status info (color, label, etc)
const getStatusInfo = (status: string) => {
  const statusUpper = status.toUpperCase();
  if (statusUpper === "OPERATING" || statusUpper === "ACTIVE") {
    return {
      color: "#16A34A",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
      label: "Beroperasi"
    };
  }
  if (statusUpper === "STOPPED" || statusUpper === "INACTIVE") {
    return {
      color: "#DC2626",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
      label: "Mati"
    };
  }
  if (statusUpper === "IDLE") {
    return {
      color: "#EAB308",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700",
      label: "Idle"
    };
  }
  return {
    color: "#6B7280",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    label: "Unknown"
  };
};



// Helper to get icon path
const getVehicleIconPath = (
  vehicleType: string | undefined,
  status: string
) => {
  const finalVehicleType = vehicleType;

  if (!finalVehicleType || finalVehicleType === "") {
    return "/assets/icons/icon_car_default.webp";
  }

  const statusSuffix = normalizeStatus(status);
  const type = finalVehicleType.toLowerCase().replace(/_/g, "-");

  const iconMapping: { [key: string]: string } = {
    "excavator": "exca",
    "dump-truck": "truck",
    "bulldozer": "bulldozer",
    "pickup-truck": "truck",
    "truck": "truck",
    "wheel-loader": "wheel-loader",
    "grader": "grader",
    "mobil-penumpang": "car",
    "mobil-beban": "car",
    "road-roller": "road-roller",
    "mpv": "car",
  };

  const iconName = iconMapping[type] || "car";

  return `/assets/icons/icon_${iconName}_${statusSuffix}.webp`;
};

// Helper to generate the custom vehicle marker icon
const getVehicleIcon = (
  vehicleType: string | undefined,
  status: string
) => {
  const iconPath = getVehicleIconPath(vehicleType, status);
  const statusInfo = getStatusInfo(status);

  return L.divIcon({
    html: `
      <div style="
        width: 48px; 
        height: 48px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        border-radius: 50%; 
        background: white;
        border: 3px solid ${statusInfo.color};
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      ">
        <img 
          src="${iconPath}" 
          alt="vehicle"
          style="
            width: 32px; 
            height: 32px; 
            object-fit: contain;
          "
          onerror="this.src='/assets/icons/icon_car_default.webp'"
        />
      </div>
    `,
    className: "custom-marker",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

// Helper to format vehicle type for display
const formatVehicleType = (type: string | undefined) => {
  if (!type || type === "") return "";

  if (type === "MPV") return "MPV";

  return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

// Helper to normalize text for search
const normalizeText = (str: string) => {
  return str.replace(/\s|[-]/g, "").toLowerCase();
};

const VehicleMap2: React.FC<VehicleMapProps> = ({ vehicleLocations }) => {
  const setSelectedVehicle = useVehicleStore((s) => s.setSelectedVehicle);
  const selectedVehicle = useVehicleStore((s) => s.selectedVehicle);
  const routeData = useVehicleStore((s) => s.routeData);
  const isShowingRoute = useVehicleStore((s) => s.isShowingRoute);

  // ✅ Ambil filter dari store
  const { selectedTypes, search } = useRightbarStore();

  // ✅ Filter vehicles berdasarkan selectedTypes dan search
  const filteredVehicles = useMemo(() => {
    return vehicleLocations.filter((vehicle) => {
      // Filter berdasarkan vehicle type - gunakan langsung dari database
      let vehicleType = vehicle.vehicle_type || "";

      // Jika vehicle type kosong atau tidak ada di filter options, masukkan ke LAINNYA
      const knownTypes = ["EXCAVATOR", "DUMP_TRUCK", "BULLDOZER", "WHEEL_LOADER", "GRADER", "ROAD_ROLLER", "MOBIL_BEBAN", "MOBIL_PENUMPANG", "MPV", "PICKUP_TRUCK"];
      if (!vehicleType || !knownTypes.includes(vehicleType)) {
        vehicleType = "LAINNYA";
      }

      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(vehicleType);

      // Filter berdasarkan search (license plate)
      const matchesSearch = search === "" || normalizeText(vehicle.license_plate).includes(normalizeText(search));

      return matchesType && matchesSearch;
    });
  }, [vehicleLocations, selectedTypes, search]);
  const routeCoordinates = routeData.map((point) => [
    parseFloat(point.latitude),
    parseFloat(point.longitude)
  ]) as [number, number][];

  const getRouteMarkers = () => {
    if (!isShowingRoute || routeData.length === 0) return [];

    return routeData.map((point, index) => {
      const statusColorMap = {
        OPERATING: "#16A34A",
        IDLE: "#EAB308",
        STOPPED: "#DC2626",
      };

      const color = statusColorMap[point.status] || "#6B7280";

      return (
        <Marker
          key={`route-${index}`}
          position={[parseFloat(point.latitude), parseFloat(point.longitude)]}
          icon={L.divIcon({
            html: `
              <div style="
                width: 6px; 
                height: 6px; 
                background: ${color};
                border: 1px solid white;
                border-radius: 50%; 
                box-shadow: 0 1px 2px rgba(0,0,0,0.3);
              "></div>
            `,
            className: "route-marker",
            iconSize: [6, 6],
          })}
        >
          <Tooltip>
            Point {index + 1}: {point.status}
          </Tooltip>
        </Marker>
      );
    });
  };

  return (
    <MapContainer
      center={[-6.2, 106.816666]}
      zoom={13}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Show live vehicle locations when not showing route - ✅ Gunakan filteredVehicles */}
      {!isShowingRoute &&
        filteredVehicles.map((vehicle) => {
          const statusInfo = getStatusInfo(vehicle.status);
          const displayType = vehicle.vehicle_type;

          return (
            <Marker
              key={vehicle.id}
              position={[vehicle.lat, vehicle.lng]}
              icon={getVehicleIcon(vehicle.vehicle_type, vehicle.status)}
              eventHandlers={{
                click: () => {
                  setSelectedVehicle(vehicle);
                },
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -24]}
                permanent={false}
                className="custom-tooltip"
              >
                <div className="text-sm flex flex-col items-start bg-white p-3 min-w-[220px]">
                  {/* Company Name */}
                  {vehicle.company_name && (
                    <p className="text-xs text-gray-500 mb-1 truncate w-full">
                      {vehicle.company_name}
                    </p>
                  )}

                  {/* License Plate - Bold */}
                  <p className="font-bold text-base text-black mb-1">
                    {vehicle.license_plate}
                  </p>

                  {/* Brand & Model */}
                  {vehicle.brand && vehicle.model && (
                    <p className="text-sm text-gray-700 mb-1">
                      {vehicle.brand} {vehicle.model}
                    </p>
                  )}

                  {/* Vehicle Type */}
                  {displayType && (
                    <p className="text-xs text-blue-600 font-medium mb-2">
                      {formatVehicleType(displayType)}
                    </p>
                  )}

                  {/* Status Badge */}
                  <div className="mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Meter Information */}
                  <div className="w-full border-t border-gray-200 pt-2">
                    {displayType === "EXCAVATOR" ||
                      displayType === "BULLDOZER" ||
                      displayType === "WHEEL_LOADER" ||
                      displayType === "GRADER" ? (
                      <p className="text-xs text-gray-600">
                        ⏱️ Hourmeter:{" "}
                        <span className="font-semibold">
                          {vehicle.hourmeter || 0} Jam
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs text-gray-600">
                        🛣️ Odometer:{" "}
                        <span className="font-semibold">
                          {vehicle.odometer
                            ? vehicle.odometer.toLocaleString()
                            : 0}{" "}
                          Km
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

      {/* Show route when selected */}
      {isShowingRoute && routeCoordinates.length > 0 && (
        <>
          <Polyline
            positions={routeCoordinates}
            color="#2563eb"
            weight={4}
            opacity={0.7}
          />
          {getRouteMarkers()}

          {/* Start marker */}
          <Marker
            position={routeCoordinates[0]}
            icon={L.divIcon({
              html: `
                <div style="
                  width: 20px; 
                  height: 20px; 
                  background: #059669;
                  color: white;
                  border: 2px solid white;
                  border-radius: 50%; 
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 10px;
                  font-weight: bold;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">S</div>
              `,
              className: "start-marker",
              iconSize: [20, 20],
            })}
          >
            <Tooltip>Mulai Perjalanan</Tooltip>
          </Marker>

          {/* End marker */}
          <Marker
            position={routeCoordinates[routeCoordinates.length - 1]}
            icon={L.divIcon({
              html: `
                <div style="
                  width: 20px; 
                  height: 20px; 
                  background: #dc2626;
                  color: white;
                  border: 2px solid white;
                  border-radius: 50%; 
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 10px;
                  font-weight: bold;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">E</div>
              `,
              className: "end-marker",
              iconSize: [20, 20],
            })}
          >
            <Tooltip>Selesai Perjalanan</Tooltip>
          </Marker>
        </>
      )}

      {/* ✅ Update FitBoundsToVehicles untuk gunakan filteredVehicles */}
      <FitBoundsToVehicles
        vehicles={isShowingRoute ? [] : selectedVehicle ? [] : filteredVehicles}
      />

      {selectedVehicle && !isShowingRoute && (
        <FlyToMarker lat={selectedVehicle.lat} lng={selectedVehicle.lng} />
      )}

      <ZoomControl position="topright" />
    </MapContainer>
  );
};

export default VehicleMap2;