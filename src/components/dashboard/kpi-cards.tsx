import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, AlertTriangle } from 'lucide-react';

type KpiCardsProps = {
  totalDeliveries: number;
  onTimeCount: number;
  anomalyCount: number;
};

export default function KpiCards({ totalDeliveries, onTimeCount, anomalyCount }: KpiCardsProps) {
  const onTimeRate = totalDeliveries > 0 ? ((onTimeCount / totalDeliveries) * 100).toFixed(1) : '0.0';

  return (
    <>
      <Card className='min-w-md max-w-sm'>
        <CardHeader className="max-w-sm flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDeliveries}</div>
          <p className="text-xs text-muted-foreground">in current dataset</p>
        </CardContent>
      </Card>
      <Card className='min-w-md max-w-sm'>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{onTimeRate}%</div>
          <p className="text-xs text-muted-foreground">{onTimeCount} successful deliveries</p>
        </CardContent>
      </Card>
      <Card className='min-w-md max-w-sm'>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>
          <AlertTriangle className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{anomalyCount}</div>
          <p className="text-xs text-muted-foreground">Require attention</p>
        </CardContent>
      </Card>
    </>
  );
}
