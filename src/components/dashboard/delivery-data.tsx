import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Delivery } from '@/lib/types';
import DeliveryChart from './delivery-chart';

type DeliveryDataProps = {
  deliveries: Delivery[];
};

export default function DeliveryData({ deliveries }: DeliveryDataProps) {
  const getBadgeVariant = (status: Delivery['status']) => {
    switch (status) {
      case 'Delivered':
        return 'default';
      case 'On Time':
        return 'secondary';
      case 'Pending':
        return 'outline';
      case 'Anomaly':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-fit">
      <CardHeader>
        <CardTitle>Deliveries Overview</CardTitle>
        <CardDescription>An overview of delivery statuses and recent items.</CardDescription>
      </CardHeader>
      <CardContent>
        <DeliveryChart deliveries={deliveries} />
        <div className="mt-8 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead className="hidden sm:table-cell">Customer</TableHead>
                <TableHead className="hidden md:table-cell">Destination</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Predicted Time (m)</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>
                    <div className="font-medium">{delivery.id}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{delivery.destination}</TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    {delivery.predictedTravelTime !== undefined ? delivery.predictedTravelTime : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getBadgeVariant(delivery.status)} className="capitalize">
                      {delivery.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
