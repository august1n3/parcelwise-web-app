import type { Delivery } from './types';

export const MOCK_DELIVERIES: Delivery[] = [
  { id: 'ORD001', customerName: 'Alice Johnson', destination: 'New York, NY', status: 'On Time', predictedDelivery: '2024-07-28', deliveryDate: '2024-07-28' },
  { id: 'ORD002', customerName: 'Bob Williams', destination: 'Los Angeles, CA', status: 'Anomaly', predictedDelivery: '2024-07-29', deliveryDate: '2024-07-30' },
  { id: 'ORD003', customerName: 'Charlie Brown', destination: 'Chicago, IL', status: 'Delivered', predictedDelivery: '2024-07-26', deliveryDate: '2024-07-26' },
  { id: 'ORD004', customerName: 'Diana Prince', destination: 'Houston, TX', status: 'On Time', predictedDelivery: '2024-07-29', deliveryDate: '2024-07-29' },
  { id: 'ORD005', customerName: 'Ethan Hunt', destination: 'Phoenix, AZ', status: 'Pending', predictedDelivery: '2024-08-01', deliveryDate: '' },
  { id: 'ORD006', customerName: 'Fiona Glenanne', destination: 'Miami, FL', status: 'Delivered', predictedDelivery: '2024-07-27', deliveryDate: '2024-07-27' },
  { id: 'ORD007', customerName: 'George Costanza', destination: 'Seattle, WA', status: 'Anomaly', predictedDelivery: '2024-07-28', deliveryDate: '2024-07-29' },
  { id: 'ORD008', customerName: 'Helen Troy', destination: 'Boston, MA', status: 'On Time', predictedDelivery: '2024-07-30', deliveryDate: '2024-07-30' },
  { id: 'ORD009', customerName: 'Ivan Drago', destination: 'Philadelphia, PA', status: 'Delivered', predictedDelivery: '2024-07-25', deliveryDate: '2024-07-25' },
  { id: 'ORD010', customerName: 'Jane Eyre', destination: 'San Diego, CA', status: 'Pending', predictedDelivery: '2024-08-02', deliveryDate: '' },
];
