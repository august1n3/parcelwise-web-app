# ParcelWise - Delivery Analytics Dashboard

A web application for analyzing delivery data with AI-powered predictions and anomaly detection.

## 🚀 Features

### 1. CSV Data Upload & Processing
Upload your delivery CSV files and get instant analysis. The system automatically:
- Parses CSV data with proper formatting
- Validates data structure and handles errors gracefully
- Processes thousands of delivery records efficiently

**Supported CSV Format:**
```csv
order_id,from_dipan_id,from_city_name,delivery_user_id,poi_lng,poi_lat,aoi_id,typecode,receipt_time,receipt_lng,receipt_lat,sign_time,sign_lng,sign_lat,ds
ORD001,DIP123,Dar es Salaam,USER456,35.73888,-6.17520,AOI789,0,2024-01-15 10:30:00,35.73888,-6.17520,2024-01-15 12:45:00,35.77238,-6.19175,2024-01-15
```

### 2. Delivery Time Prediction
Predicts delivery times using an external machine learning model.

**How it works:**
1. **Data Transformation**: Automatically converts CSV data to model format
2. **Feature Engineering**: 
   - Extracts hour and day of week from timestamps
   - Calculates distance between pickup and delivery points using GPS coordinates
   - Encodes city names to numerical values
   - Processes delivery type codes
3. **API Call**: Sends data to external model at `http://34.35.16.97:8080/predict`
4. **Results**: Returns predicted travel times in minutes

**Input Format for Model:**
```json
[
  {
    "receipt_lng": 35.73888,
    "receipt_lat": -6.17520,
    "sign_lng": 35.77238,
    "sign_lat": -6.19175,
    "hour": 15,
    "day_of_week": 4,
    "distance_km": 10.2,
    "city_encoded": 3,
    "typecode_encoded": 0
  }
]
```

**Response Format:**
```json
{
  "predicted_travel_times": [128.4, 126.5, 142.8]
}
```

### 3. Data Summarization
Automatically analyzes your delivery data and provides insights.

**What it calculates:**
- **Basic Stats**: Total orders, unique cities, delivery types
- **Time Analysis**: Average, median, fastest, and slowest delivery times
- **Performance Metrics**: Standard deviation and delivery time distribution

**Example Summary:**
```
Dataset Summary:
• Total Orders: 1,250
• Unique Cities: 5
• Unique Type Codes: 3

Delivery Time Analysis:
• Average Delivery Time: 128.5 minutes
• Median Delivery Time: 125.0 minutes
• Fastest Delivery: 45.2 minutes
• Slowest Delivery: 380.7 minutes
• Standard Deviation: 62.3 minutes
```

### 4. Anomaly Detection
Identifies unusual delivery patterns using statistical methods.

**How it works:**
1. **IQR Method**: Uses Interquartile Range to detect outliers
2. **Threshold Setting**: Configurable sensitivity (default: 1.5x IQR)
3. **Classification**: Categorizes anomalies as "high" (too slow) or "low" (too fast)
4. **Reporting**: Provides counts and average times for each anomaly type

**Anomaly Categories:**
- **High Anomalies**: Deliveries taking unusually long (potential delays)
- **Low Anomalies**: Deliveries completed unusually fast (potential data errors)

**Example Anomaly Report:**
```
Detected 45 anomalies in delivery times:
• 32 unusually long delivery times (avg: 245.8 minutes)
• 13 unusually short delivery times (avg: 18.3 minutes)
```

## 🛠️ Technical Implementation

### CSV Processing Pipeline
```
CSV Upload → Parse → Validate → Transform → Analyze → Display
```

### Prediction Pipeline
```
CSV Data → Feature Engineering → API Call → Results → Dashboard Update
```

### Data Flow
1. **Upload**: User uploads CSV file through web interface
2. **Parse**: System reads and validates CSV structure
3. **Transform**: Converts raw data to model-ready format
4. **Predict**: Calls external ML model API
5. **Analyze**: Performs statistical analysis and anomaly detection
6. **Display**: Shows results in interactive dashboard

## 📊 Dashboard Components

- **KPI Cards**: Quick overview of key metrics
- **Data Table**: Detailed view of all deliveries with predictions
- **Charts**: Visual representation of delivery status distribution
- **AI Summary**: Automated insights and anomaly reports

## 🔧 Configuration

### City Encoding
Cities are automatically encoded to numerical values:
```javascript
{
  'Dar es Salaam': 0,
  'Dodoma': 1,
  'Mwanza': 2,
  'Arusha': 3,
  'Mbeya': 4
}
```

### Anomaly Detection Settings
- **Threshold**: 1.5 (adjustable)
- **Method**: IQR (Interquartile Range)
- **Categories**: High/Low anomalies

### API Configuration
- **Endpoint**: `http://34.35.16.97:8080/predict`
- **Method**: POST
- **Content-Type**: application/json

## 🚦 Status Classification

Deliveries are automatically classified based on predicted time:
- **On Time**: ≤ 180 minutes (3 hours)
- **Anomaly**: > 180 minutes (potential issues)

## 📝 Error Handling

The system handles various error scenarios:
- **Invalid CSV format**: Clear error messages with format guidance
- **API failures**: Graceful degradation with retry suggestions
- **Data validation**: Automatic cleaning and validation of input data
- **Network issues**: User-friendly error reporting

## 🎯 Use Cases

1. **Operations Management**: Monitor delivery performance in real-time
2. **Route Optimization**: Identify problematic delivery routes
3. **Quality Control**: Detect data entry errors and unusual patterns
4. **Performance Analytics**: Track delivery time trends and improvements
5. **Predictive Planning**: Forecast delivery times for better scheduling

## 📈 Benefits

- **No Manual Analysis**: Automatic processing of large datasets
- **Real-time Insights**: Instant feedback on uploaded data
- **Anomaly Detection**: Proactive identification of delivery issues
- **Predictive Analytics**: AI-powered delivery time predictions
- **User-friendly Interface**: Simple drag-and-drop CSV upload

## 🚀 Getting Started

1. **Development**: `npm run dev`
2. **Build**: `npm run build`
3. **Type Check**: `npm run typecheck`
4. **Lint**: `npm run lint`

---

*For technical support or questions about the data format, please refer to the application interface or contact the development team.*
