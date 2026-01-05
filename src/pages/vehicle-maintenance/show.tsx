import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { VehicleMaintenanceDetailTable, VehicleMaintenanceDetailTableRef } from './components/table-detail';
import { useRef } from 'react';
import useSWR from 'swr';
import { apiVehicleMaintenance } from '@/api/vehicle-maintenance';
import { Skeleton } from '@/components/ui/skeleton';
import { VehicleMaintenanceDetailDialogExcel } from './components/dialog-detail-excel';

export default function VehicleMaintenanceShowPage() {
  const navigate = useNavigate()
  const params = useParams()
  const tableRef = useRef<VehicleMaintenanceDetailTableRef>(null)
  const [searchParams, setSearchParams] = useSearchParams();
  const id = Number(params.id);
  const { isLoading } = useSWR(['/vehicle-maintenance/detail', id], ([, id]) => apiVehicleMaintenance.detail(id), {
    onError() {
      navigate('/vehicle-maintenances')
    }
  })

  if (isLoading) return <Skeleton className="size-full" />
  
  return (
    <div className="p-4 h-full">
      <div className="bg-white rounded-xl p-6 flex flex-col  h-full w-full">
        {/* HEADER */}
        <div className="flex items-center justify-between p-2">
          <h1 className="text-lg font-semibold">Detail Riwayat Service</h1>

          <Button asChild type="button" className="bg-transparent border border-gray-400 text-stone-950 hover:bg-gray-200">
            <Link to={'/vehicle-maintenances'}>Kembali</Link>
          </Button>
        </div>

        <VehicleMaintenanceDetailDialogExcel filter={{ maintananceId: id }}>
          <Button asChild type="button" className="ml-auto mr-4 bg-blue-900 cursor-pointer">
            <div>
              <Download size={12} />
              <span>Unduh Laporan</span>
            </div>
          </Button>
        </VehicleMaintenanceDetailDialogExcel>

        {/* TABLE */}
        <VehicleMaintenanceDetailTable 
          ref={tableRef}
          filter={{ maintananceId: id }}
          searchParams={searchParams} 
          setSearchParams={setSearchParams}
        />
      </div>
    </div>
  );
}
