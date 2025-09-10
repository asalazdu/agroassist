// Tipos para autenticación
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  farmSize?: string;
  crops?: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

// Tipos para clima
export interface WeatherData {
  current: {
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: DayForecast[];
  location: string;
}

export interface DayForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  description: string;
  icon: string;
  humidity: number;
  precipitation: number;
}

// Tipos para cultivos y recomendaciones
export interface Crop {
  id: string;
  name: string;
  plantingDate: string;
  expectedHarvest: string;
  currentStage: string;
  area: number;
}

export interface Recommendation {
  id: string;
  type: 'watering' | 'fertilizing' | 'pest_control' | 'harvesting';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  date: string;
}

// Tipos de navegación
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Profile: undefined;
  Weather: undefined;
  Crops: undefined;
  Recommendations: undefined;
  Pests: undefined;
  MarketPrices: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Weather: undefined;
  Crops: undefined;
  Pests: undefined;
  MarketPrices: undefined;
  Recommendations: undefined;
  Profile: undefined;
};

// Tipos para Plagas
export interface Pest {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  symptoms: string[];
  affectedCrops: string[];
  treatment: string[];
  prevention: string[];
  severity: 'baja' | 'media' | 'alta' | 'crítica';
  imageUrl?: string;
  commonNames: string[];
}

export interface PestIdentification {
  pestId: string;
  confidence: number;
  pest: Pest;
}

// Tipos para Precios del Mercado
export interface MarketPrice {
  id: string;
  productName: string;
  category: string;
  currentPrice: number;
  previousPrice: number;
  priceChange: number;
  priceChangePercent: number;
  unit: string;
  market: string;
  region: string;
  date: string;
  quality: 'premium' | 'estándar' | 'básica';
}

export interface PriceHistory {
  date: string;
  price: number;
}

export interface MarketAnalysis {
  product: string;
  averagePrice: number;
  trend: 'alcista' | 'bajista' | 'estable';
  forecast: string;
  recommendations: string[];
  priceHistory: PriceHistory[];
}
