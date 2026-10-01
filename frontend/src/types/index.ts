export interface POI {
  id: number;
  name: string;
  category: string;
  description?: string;
  lat: number;
  lon: number;
  estimated_duration_min: number;
  opening_hours?: string;
  ticket_price: number;
  image_url?: string;
  tips?: string;
  ideal_time?: 'morning' | 'afternoon' | 'evening' | 'any';
  closed_days?: number[];
  closed_time?: string;
  venue_type?: 'indoor' | 'outdoor' | 'semi-indoor';
  address?: string;
  is_custom?: boolean;
  golden_hour?: string;
}

export type WeatherConditionType = 'FAVORABLE' | 'RAIN' | 'HEAT_PEAK';

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  uvIndex: number;
  condition: WeatherConditionType;
  conditionLabel: string;
  conditionIcon: string;
  advice: string;
  updatedAt: string;
}

export interface HourlyForecastItem {
  time: string;
  hour: number;
  rainProb: number;
  weatherCode: number;
  temp?: number;
}

export type CongestionLevel = 'LOW' | 'MODERATE' | 'HEAVY';

export interface TrafficStatus {
  level: CongestionLevel;
  multiplier: number;
  label: string;
  color: string;
  extraMinutes: number;
  description: string;
  isPeakHour: boolean;
}

export type SimulationScenario = 'LIVE' | 'RAIN_STORM' | 'HEAT_WAVE' | 'PEAK_EVENING' | 'AUTUMN_PERFECT';

export interface ContextSuggestion {
  id: string;
  type: 'weather_rain' | 'weather_heat' | 'traffic_congestion';
  title: string;
  message: string;
  beforePoiName?: string;
  recommendedPoiName?: string;
  applied: boolean;
  adaptedPlan?: PlanResponse;
}

export interface ScoreBreakdown {
  distance_score: number;
  rating_score: number;
  price_penalty: number;
}

export interface Accommodation {
  id: number;
  name: string;
  type: string;
  stars: number;
  rating: number;
  price_per_night: number;
  address?: string;
  phone?: string;
  lat: number;
  lon: number;
  distance_to_median_m?: number;
  multi_criteria_score?: number;
  score_breakdown?: ScoreBreakdown;
}

export interface GeometricMedian {
  lat: number;
  lon: number;
  method: string;
  iterations: number;
  mean_distance_to_pois_km: number;
  centroid_comparison_gain_km: number;
}

export interface LegDetail {
  from_name: string;
  to_name: string;
  distance_km: number;
  duration_min: number;
}

export interface DayItinerary {
  day: number;
  hotel: Accommodation;
  visit_sequence: POI[];
  legs: LegDetail[];
  total_distance_km: number;
  total_duration_min: number;
  route_geojson: any;
}

export interface PlanResponse {
  success: boolean;
  days: number;
  total_pois: number;
  geometric_median: GeometricMedian;
  recommended_accommodations: Accommodation[];
  selected_hotel: Accommodation;
  daily_itineraries: DayItinerary[];
  total_trip_distance_km: number;
  total_trip_duration_min: number;
  transport_mode?: string;
  message?: string;
}

export interface WeightsConfig {
  w_distance: number;
  w_rating: number;
  w_price: number;
}

export interface PlanRequest {
  poi_ids: number[];
  days: number;
  max_budget?: number;
  min_stars?: number;
  radius_meters: number;
  weights: WeightsConfig;
  selected_hotel_id?: number;
  transport_mode?: string;
  traffic_multiplier?: number;
  weather_condition?: string;
}
