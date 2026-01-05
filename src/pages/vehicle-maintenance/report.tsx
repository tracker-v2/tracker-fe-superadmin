// components ui
import { Button } from '@/components/ui/button';
// icons
import { Download } from 'lucide-react';

// library
import { Link, useSearchParams } from 'react-router-dom';
import { VehicleMaintenanceDetailTable, VehicleMaintenanceDetailTableRef } from './components/table-detail';
import { useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { VehicleMaintenanceDetailFilterVehicle } from './components/filter-detail-vehicle';
import { DateRange } from 'react-day-picker';
import { endOfDay, startOfDay, startOfMonth } from 'date-fns';
import { DateRangePicker } from '../../components/ui/date-range-picker';
import { VehicleMaintenanceDetailDialogExcel } from './components/dialog-detail-excel';

export default function VehicleMaintenanceReportPage() {
    const [filterVehicle, setFilterVehicle] = useState<string[]>([]);
    const [filterDate, setFilterDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: new Date(),
    })
    const tableRef = useRef<VehicleMaintenanceDetailTableRef>(null)
    const [searchParams, setSearchParams] = useSearchParams();
  
    return (
        <div className="h-full">
        <div className="bg-white rounded-xl p-6 flex flex-col  h-full w-full">
            {/* HEADER */}
            <div className="flex items-center justify-between p-2">
            <h1>Riwayat Service</h1>

            <Button asChild type="button" className="bg-transparent border border-gray-400 text-stone-950 hover:bg-gray-200">
                <Link to={"/perawatan-kendaraan"}>Kembali</Link>
            </Button>
            </div>

            <div className="w-full flex px-4 mb-2">
            <form className="flex space-x-3 x items-end">
                {/* MULTI SELECT */}
                <div className="flex flex-col space-y-2">
                    <Label htmlFor="kendaraan" className="text-gray-600">
                        Kendaraan
                    </Label>
                    <VehicleMaintenanceDetailFilterVehicle value={filterVehicle} onChange={setFilterVehicle} />
                </div>

                {/* DATE */}
                <div className="flex flex-col space-y-2">
                    <Label htmlFor="rentang-tanggal" className="text-gray-600">
                        Rentang Tanggal
                    </Label>

                    <DateRangePicker
                        placeholder="Massukan Rentang Tanggal"
                        value={filterDate}
                        onChange={setFilterDate}
                    />
                </div>

                {/* <Button className="w-[104px] bg-blue-900">Cari</Button> */}
            </form>

            <VehicleMaintenanceDetailDialogExcel 
                filter={{ 
                    licensePlates: filterVehicle, 
                    startDate: filterDate?.from
                        ? startOfDay(filterDate.from).toISOString()
                        : undefined,
                    endDate: filterDate?.to ? endOfDay(filterDate.to).toISOString() : undefined,
                }}
            >
                <Button asChild type="button" className="ml-auto  bg-blue-900 cursor-pointer">
                    <div>
                    <Download size={12} />
                    <span>Unduh Laporan</span>
                    </div>
                </Button>
            </VehicleMaintenanceDetailDialogExcel>
            </div>

            {/* TABLE */}
            <VehicleMaintenanceDetailTable 
                ref={tableRef} 
                filter={{
                    licensePlates: filterVehicle, 
                    startDate: filterDate?.from
                        ? startOfDay(filterDate.from).toISOString()
                        : undefined,
                    endDate: filterDate?.to ? endOfDay(filterDate.to).toISOString() : undefined,
                }}
                searchParams={searchParams} 
                setSearchParams={setSearchParams}
            />
        </div>
        </div>
    );
}
