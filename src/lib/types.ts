export type Delivery = {
  id: string;
  customerName: string;
  destination: string;
  status: 'On Time' | 'Delayed' | 'Delivered' | 'Pending' | 'Anomaly';
  predictedDelivery: string;
  deliveryDate: string;
  predictedTravelTime?: number;
};
