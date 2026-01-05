import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Vehicle } from "@/types/types";
import { FitBoundsToVehicles } from "./focus-vehicle";

interface VehicleMapProps {
  vehicleLocations: Vehicle[];
}

// Normalize status to handle both formats (OPERATING/STOPPED/IDLE and active/inactive/idle)
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



// Helper to get icon path based on vehicle type and status
const getVehicleIconPath = (
  vehicleType: string | undefined,
  status: string
) => {
  const finalVehicleType = vehicleType;

  if (!finalVehicleType || finalVehicleType === "") {
    return "/assets/icons/icon_car_default.webp";
  }

  // Get normalized status suffix
  const statusSuffix = normalizeStatus(status);

  // Convert vehicle type to lowercase and replace underscores with hyphens
  const type = finalVehicleType.toLowerCase().replace(/_/g, "-");

  // Map vehicle types to icon names
  const iconMapping: { [key: string]: string } = {
    "excavator": "exca",
    "dump-truck": "truck",
    "bulldozer": "bulldozer",
    "pickup-truck": "car",
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

const VehicleMap: React.FC<VehicleMapProps> = ({ vehicleLocations }) => {
  return (
    <MapContainer
      center={[-6.2, 106.8167]}
      zoom={13}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {vehicleLocations.map((vehicle) => {
        const statusInfo = getStatusInfo(vehicle.status);
        const displayType = vehicle.vehicle_type;

        return (
          <Marker
            key={vehicle.id}
            position={[vehicle.lat, vehicle.lng]}
            icon={getVehicleIcon(vehicle.vehicle_type, vehicle.status)}
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

      {/* Automatically fit all markers in view */}
      <FitBoundsToVehicles vehicles={vehicleLocations} />

      <ZoomControl position="topright" />
    </MapContainer>
  );
};

export default VehicleMap;