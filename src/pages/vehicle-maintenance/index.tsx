import { Link, useSearchParams } from "react-router-dom";
import { VehicleMaintenanceTable, VehicleMaintenanceTableRef } from "./components/table";
import { NotebookText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeferredValue, useRef, useState } from "react";
import { VehicleMaintenanceDialogCreate } from "./components/dialog-create";

export default function VehicleMaintenanceIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState<string>(() => searchParams.get('search') ?? '')
  const deferredSearch = useDeferredValue(search)
  const tableRef = useRef<VehicleMaintenanceTableRef>(null)

  return (
    <div className="h-full">
      <div className="bg-white rounded-xl p-6 flex flex-col  h-full w-full">
        {/* HEADER */}
        <div className="w-full max-h-[74px] px-4 flex justify-between items-center">
          {/* SEARCH & FILTER */}
          <div className="flex">
            <form>
              <div className="flex flex-col gap-2.5 relative ">
                <label htmlFor="search">Cari Kendaraan</label>
                <Search size={16} className="absolute left-3 top-11  text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" id="search" className="border rounded-md h-10 pl-10 pr-4 w-full placeholder:text-gray-500" placeholder="Cari " />
              </div>
            </form>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-x-2">
            <VehicleMaintenanceDialogCreate onSuccess={() => { tableRef.current?.refresh() }}>
              <Button asChild className="bg-blue-900 px-2 cursor-pointer gap-x-1 hover:bg-blue-600">
                <div>
                  <Plus size={16} />
                  <span className="text-primary-foreground text-sm font-medium">Jadwal Service</span>
                </div>
              </Button>
            </VehicleMaintenanceDialogCreate>

            <Button asChild className="bg-blue-900 px-2 cursor-pointer gap-x-1 hover:bg-blue-600">
              <Link to={'/vehicle-maintenances/reports'}>
                <NotebookText size={16} />
                <span className="text-primary-foreground text-sm font-medium">Semua Laporan</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-10">
          <VehicleMaintenanceTable ref={tableRef} searchParams={searchParams} setSearchParams={setSearchParams} search={deferredSearch} />
        </div>
      </div>
    </div>
  );
}
