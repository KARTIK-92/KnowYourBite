import { GoogleGenAI, Type } from "@google/genai";
import { ProductData, UserStats, DailyGoals } from '../types';

// Lazy initialization
let aiInstance: GoogleGenAI | null = null;

const getAi = () => {
  if (!aiInstance) {
    // Safe access for API key in browser environments (Vite)
    // @ts-ignore
    const apiKey = (typeof process !== 'undefined' ? process.env?.API_KEY : undefined) || 
                   // @ts-ignore
                   (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_KEY : undefined);

    if (!apiKey) {
      console.error("Gemini API Key is missing. Ensure VITE_API_KEY or process.env.API_KEY is set.");
      throw new Error("API_KEY_MISSING");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

// --- Caching Logic ---
const CACHE_PREFIX = 'kyb_search_v1_';

const getFromCache = (query: string): ProductData | null => {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + query.toLowerCase().trim());
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("Cache read error", e);
  }
  return null;
};

const saveToCache = (query: string, data: ProductData) => {
  try {
    localStorage.setItem(CACHE_PREFIX + query.toLowerCase().trim(), JSON.stringify(data));
  } catch (e) {
    console.warn("Cache write error", e);
  }
};

// --- Schemas ---

const productSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    brand: { type: Type.STRING },
    category: { type: Type.STRING },
    healthReasoning: { type: Type.STRING },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          status: { type: Type.STRING, enum: ['good', 'bad', 'neutral'] },
          reason: { type: Type.STRING },
        }
      }
    },
    nutrition: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER, description: "Energy in kcal per 100g" },
        protein: { type: Type.NUMBER, description: "Protein in grams per 100g" },
        carbs: { type: Type.NUMBER, description: "Carbohydrates in grams per 100g" },
        fats: { type: Type.NUMBER, description: "Fat in grams per 100g" },
        sugar: { type: Type.NUMBER, description: "Sugars in grams per 100g" },
        fiber: { type: Type.NUMBER, description: "Fiber in grams per 100g" },
        salt: { type: Type.NUMBER, description: "Salt in grams per 100g" },
      }
    },
    certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
    pros: { type: Type.ARRAY, items: { type: Type.STRING } },
    cons: { type: Type.ARRAY, items: { type: Type.STRING } },
    additives: { type: Type.ARRAY, items: { type: Type.STRING } },
    healthierAlternatives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          brand: { type: Type.STRING },
          reason: { type: Type.STRING },
          calories: { type: Type.NUMBER }
        }
      }
    }
  },
  required: ['name', 'ingredients', 'nutrition']
};

const dailyGoalsSchema = {
  type: Type.OBJECT,
  properties: {
    calories: { type: Type.NUMBER },
    protein: { type: Type.NUMBER },
    carbs: { type: Type.NUMBER },
    fats: { type: Type.NUMBER },
    sugar: { type: Type.NUMBER },
    fiber: { type: Type.NUMBER },
    salt: { type: Type.NUMBER },
  },
  required: ['calories', 'protein', 'carbs', 'fats', 'sugar', 'fiber', 'salt']
};

const mealAnalysisSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      item_name: { type: Type.STRING, description: "Name of the food item" },
      portion_desc: { type: Type.STRING, description: "Description of the portion size used for calculation" },
      nutrition: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
          sugar: { type: Type.NUMBER },
          fiber: { type: Type.NUMBER },
          salt: { type: Type.NUMBER },
        }
      }
    }
  }
};

// --- Analysis Functions ---

export const analyzeProductImage = async (base64Image: string): Promise<ProductData> => {
  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Analyze this image. First, determine if it contains a food item, meal, or beverage. If it does NOT contain food, return a JSON where 'name' is 'NON_FOOD_ITEM' and other required fields are empty/zero. If it IS food, identify the product, estimate its nutritional value per 100g (or per 100ml for liquids), analyze ingredients based on typical formulation if not visible. Suggest 2-3 healthier alternatives if applicable. DATA CONSISTENCY RULE: If you detect sugar, cane sugar, syrup, honey, fructose, or any sweetener in the ingredients, the 'sugar' field in nutrition MUST be greater than 0. Do not return 0g sugar if ingredients contain sugar." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: productSchema,
        temperature: 0, // Deterministic
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);

    if (data.name === 'NON_FOOD_ITEM') {
      throw new Error("This image does not appear to contain a food item.");
    }

    return {
      ...data,
      id: crypto.randomUUID(),
      imageUrl: `data:image/jpeg;base64,${base64Image}`
    };
  } catch (error: any) {
    console.error("Gemini Image Analysis Error:", error);
    if (error.message === 'API_KEY_MISSING') throw error;
    throw new Error(error.message || "Failed to analyze product image.");
  }
};

async function searchOpenFoodFacts(query: string) {
  try {
    // Request more items to find the best match
    const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.products && data.products.length > 0) {
      // Find the product with the most complete nutrition data
      const bestMatch = data.products.find((p: any) => 
        p.nutriments && 
        (p.nutriments['energy-kcal_100g'] !== undefined || p.nutriments['energy-kcal'] !== undefined) &&
        p.ingredients_text
      );
      
      return bestMatch || data.products[0];
    }
    return null;
  } catch (e) {
    console.warn("OpenFoodFacts search failed", e);
    return null;
  }
}

export const searchProductByName = async (query: string): Promise<ProductData> => {
  // 1. Check Cache
  const cached = getFromCache(query);
  if (cached) {
    console.log("Returning cached result for:", query);
    return cached;
  }

  let offData = null;
  
  // 2. Try to get real data
  try {
    offData = await searchOpenFoodFacts(query);
  } catch (e) {
    console.warn("OFF lookup error", e);
  }

  let prompt = "";
  
  if (offData) {
     const info = {
        name: offData.product_name || query,
        brand: offData.brands || "Unknown",
        ingredients: offData.ingredients_text || "Not available",
        nutrition: {
           calories: offData.nutriments?.['energy-kcal_100g'] || offData.nutriments?.['energy-kcal'],
           protein: offData.nutriments?.proteins_100g,
           carbs: offData.nutriments?.carbohydrates_100g,
           fats: offData.nutriments?.fat_100g,
           sugar: offData.nutriments?.sugars_100g,
           salt: offData.nutriments?.salt_100g
        }
     };
     
     prompt = `You are a strict data extraction engine. Analyze this product based on the provided database record: ${JSON.stringify(info)}.
     
     INSTRUCTIONS:
     1. Use the provided 'nutrition' values EXACTLY as they appear for the 'per 100g' fields. Do not hallucinate numbers if real ones are provided.
     2. If specific nutrition fields are null/undefined in the input, strictly estimate them based on the product ingredients and type.
     3. Analyze the ingredients text to categorize them (good/bad/neutral).
     4. Suggest 3 specific healthier alternatives.
     
     CRITICAL CONSISTENCY RULES:
     - IF input nutrition.sugar is 0 BUT ingredients list contains 'sugar', 'cane sugar', 'corn syrup', 'honey', 'fructose', 'glucose': YOU MUST OVERRIDE the sugar value to a realistic non-zero estimate (e.g., 5-50g depending on product). A product with sugar in ingredients cannot have 0g sugar.
     - IF input nutrition.calories is missing, calculate it roughly: (Fat*9) + (Carbs*4) + (Protein*4).
     
     Return JSON strictly matching the schema.`;
  } else {
     prompt = `Analyze the food product query: "${query}".
     
     INSTRUCTIONS:
     1. Determine if this is a valid food item. If NOT (e.g. "laptop"), return name="NON_FOOD_ITEM".
     2. If it is food, generate a comprehensive nutritional profile for 100g of the product.
     3. You must provide REALISTIC estimates for Calories, Protein, Carbs, Fats, Sugar, Fiber, Salt.
     4. Suggest 3 specific healthier alternative products.
     
     CRITICAL CONSISTENCY RULE:
     - If the generated ingredients contain added sugars (sugar, syrup, etc.), the 'sugar' value MUST be > 0.
     
     Return JSON strictly matching the schema.`;
  }

  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: productSchema,
        temperature: 0, // Force deterministic output
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    
    if (data.name === 'NON_FOOD_ITEM') {
        throw new Error("No food item found matching that query.");
    }
    
    // Use OFF image if available, otherwise placeholder
    const imageUrl = offData?.image_front_url || offData?.image_url || `https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(data.name)}`;

    const result = {
      ...data,
      id: crypto.randomUUID(),
      imageUrl: imageUrl
    };

    // 3. Save to Cache
    saveToCache(query, result);

    return result;
  } catch (error: any) {
    console.error("Gemini Text Analysis Error:", error);
    if (error.message === 'API_KEY_MISSING') throw error;
    throw new Error(error.message || "Failed to find product information.");
  }
};

export const generatePersonalizedDietPlan = async (stats: UserStats): Promise<DailyGoals> => {
  const prompt = `
    Calculate the optimal daily nutritional goals for a user with the following profile:
    Age: ${stats.age}
    Gender: ${stats.gender}
    Weight: ${stats.weight}kg
    Height: ${stats.height}cm
    Activity Level: ${stats.activityLevel}
    Goal: ${stats.goal}

    Return the target daily calories, protein (g), carbs (g), fats (g), sugar (g), fiber (g), and salt (g).
    Strictly JSON format matching the schema.
  `;

  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dailyGoalsSchema,
        temperature: 0, // Deterministic
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Gemini Diet Plan Generation Error:", error);
    if (error.message === 'API_KEY_MISSING') throw error;
    throw new Error(error.message || "Failed to generate diet plan.");
  }
};

export const analyzeMeal = async (description: string): Promise<any[]> => {
  const prompt = `Analyze the nutritional content of this meal description: "${description}".
  Break it down into individual food items.
  For each item, estimate the TOTAL nutritional values for the specific quantity described in the text.
  If quantity is implied (e.g. "an apple"), use that.
  If quantity is vague, assume a standard medium serving.
  Return a JSON array of items strictly following the schema.`;

  try {
    const response = await getAi().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: mealAnalysisSchema,
            temperature: 0, // Deterministic
        }
    });
    return JSON.parse(response.text || "[]");
  } catch (error: any) {
      console.error("Meal Analysis Error", error);
      if (error.message === 'API_KEY_MISSING') throw error;
      throw new Error("Failed to analyze meal.");
  }
}
