import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Delivery } from '@/lib/types';
import DeliveryChart from './delivery-chart';

type DeliveryDataProps = {
  deliveries: Delivery[];
};

import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

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
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const totalPages = Math.ceil(deliveries.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deliveries Overview</CardTitle>
        <CardDescription>An overview of delivery statuses and recent items.</CardDescription>
      </CardHeader>
      <CardContent>
        <DeliveryChart deliveries={deliveries} />
        <div className="mt-8 border rounded-md">
          {/* Pagination controls */}
          <div className="mt-2 mb-4 mx-2 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="disabled:opacity-50 mb-2 sm:mb-0"
            >
              Previous
            </Button>
            <div className='text-sm w-full sm:w-fit text-center'>
              Page <Input className='mx-1 my-1 w-1/4 sm:w-16 text-sm text-center rounded-full transition-colors duration-300 inline' value={currentPage} onChange={(e) => setCurrentPage(Number(e.target.value))} /> of {totalPages}
            </div>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="disabled:opacity-50 mt-2 sm:mt-0"
            >
              Next
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead className="hidden md:table-cell">Destination</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Predicted Time(m)</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Actual Time(m)</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>
                    <div className="font-medium">{delivery.id}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{delivery.destination}</TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    {delivery.predictedTravelTime !== undefined ? delivery.predictedTravelTime : 'N/A'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    {delivery.actualTravelTime !== undefined ? delivery.actualTravelTime : 'N/A'}
                  </TableCell>
                  <TableCell className="sm:table-cell text-right">
                    <Badge variant={getBadgeVariant(delivery.status)} className="capitalize">
                      {delivery.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination controls */}
          <div className="mt-4 mb-2 mx-2 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="disabled:opacity-50 mb-2 sm:mb-0"
            >
              Previous
            </Button>
            <div className='text-sm w-full sm:w-fit text-center'>
              Page <Input className='mx-1 my-1 w-1/4 sm:w-16 text-sm text-center rounded-full transition-colors duration-300 inline' value={currentPage} onChange={(e) => setCurrentPage(Number(e.target.value))} /> of {totalPages}
            </div>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="disabled:opacity-50 mt-2 sm:mt-0"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
