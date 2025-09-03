export type Delivery = {
  id: string;
  customerName: string;
  destination: string;
  status: 'On Time' | 'Delayed' | 'Delivered' | 'Pending' | 'Anomaly';
  actualTravelTime: number;
  deliveryDate: string;
  predictedTravelTime?: number;
};
