/**
 * @fileOverview Utility functions for delivery data processing
 */

// Types for the prediction input and output
export interface DeliveryPredictionInput {
  receipt_lng: number;
  receipt_lat: number;
  poi_lng: number;
  poi_lat: number;
  hour: number;
  day_of_week: number;
  distance_km: number;
  city_encoded: number;
}

export interface PredictionResponse {
  predicted_travel_times: number[];
}

// Helper function to calculate distance between two points
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to encode city names (adjust this based on your encoding logic)
export function encodeCityName(cityName: string): number {
  const cityMap: Record<string, number> = {
    'Dar es Salaam': 0,
    'Dodoma': 1,
    'Mwanza': 2,
    'Arusha': 3,
    'Mbeya': 4,
    // Add more city mappings as needed
  };
  return cityMap[cityName] || 0; // Default to 0 for unknown cities
}

// CSV field mapping based on the provided order:
// order_id,from_dipan_id,from_city_name,delivery_user_id,poi_lng,poi_lat,aoi_id,receipt_time,receipt_lng,receipt_lat,sign_time,poi_lng,poi_lat,ds
export function transformCsvToModelInput(csvRecord: Record<string, any>): DeliveryPredictionInput {
  // Extract time features from receipt_time
  const receiptDate = new Date(csvRecord.receipt_time);
  const hour = receiptDate.getHours();
  const day_of_week = receiptDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate distance using Haversine formula
  const distance_km = calculateDistance(
    parseFloat(csvRecord.receipt_lat),
    parseFloat(csvRecord.receipt_lng),
    parseFloat(csvRecord.poi_lat),
    parseFloat(csvRecord.poi_lng)
  );
  
  // Encode city name (you may need to adjust this based on your encoding logic)
  const city_encoded = encodeCityName(csvRecord.from_city_name);
  
  
  return {
    receipt_lng: parseFloat(csvRecord.receipt_lng),
    receipt_lat: parseFloat(csvRecord.receipt_lat),
    poi_lng: parseFloat(csvRecord.poi_lng),
    poi_lat: parseFloat(csvRecord.poi_lat),
    hour,
    day_of_week,
    distance_km,
    city_encoded
  };
}
