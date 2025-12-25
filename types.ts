
export interface Ingredient {
  name: string;
  status: 'good' | 'bad' | 'neutral';
  reason: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  sugar: number;
  fiber?: number;
  salt?: number;
}

export interface ProductAlternative {
  name: string;
  brand: string;
  reason: string;
  calories?: number;
}

export interface ProductData {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl?: string;
  healthReasoning: string;
  ingredients: Ingredient[];
  nutrition: NutritionInfo;
  certifications: string[];
  pros: string[];
  cons: string[];
  additives: string[];
  healthierAlternatives?: ProductAlternative[];
}

export interface DietItem {
  product: ProductData;
  quantity: number; // Multiplier of the base serving (e.g., 1.5 servings)
  unit?: string; // e.g., "g", "ml", "serving"
  addedAt: string;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface UserStats {
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number; // kg
  height: number; // cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose_weight' | 'maintain' | 'gain_muscle';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, never store plain text passwords
  dailyGoals: DailyGoals;
  history: ProductData[]; // Changed to store full product data for history display
  dietPlan: DietItem[];
  stats?: UserStats;
}
