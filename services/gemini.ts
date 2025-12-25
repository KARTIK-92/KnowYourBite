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

// Schema for structured JSON output
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
        calories: { type: Type.NUMBER, description: "Calories per serving" },
        protein: { type: Type.NUMBER },
        carbs: { type: Type.NUMBER },
        fats: { type: Type.NUMBER },
        sugar: { type: Type.NUMBER },
        fiber: { type: Type.NUMBER },
        salt: { type: Type.NUMBER },
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
  },
  required: ['calories', 'protein', 'carbs', 'fats']
};

export const analyzeProductImage = async (base64Image: string): Promise<ProductData> => {
  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Analyze this food product image. Identify the product, estimate its nutritional value per serving, analyze ingredients based on typical formulation if not visible. Suggest 2-3 healthier alternatives if applicable." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: productSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);
    return {
      ...data,
      id: crypto.randomUUID(),
      imageUrl: `data:image/jpeg;base64,${base64Image}` // Store the image to show it back
    };
  } catch (error: any) {
    console.error("Gemini Image Analysis Error:", error);
    if (error.message === 'API_KEY_MISSING') throw error;
    throw new Error(error.message || "Failed to analyze product image.");
  }
};

async function searchOpenFoodFacts(query: string) {
  try {
    // Search OpenFoodFacts
    const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.products && data.products.length > 0) {
      // Return the best match
      return data.products[0];
    }
    return null;
  } catch (e) {
    console.warn("OpenFoodFacts search failed", e);
    return null;
  }
}

export const searchProductByName = async (query: string): Promise<ProductData> => {
  let offData = null;
  
  // Try to get real data first
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
     
     prompt = `Analyze this product based on the following real data found from a database: ${JSON.stringify(info)}.
     If nutrition data is missing in the input, estimate it based on the product type.
     Provide a detailed analysis, pros/cons, and ingredient breakdown.
     Crucially, suggest 3 specific healthier alternative products (competitors or variants) available in the market.
     The output must strictly follow the JSON schema.`;
  } else {
     prompt = `Provide detailed nutritional analysis for the product: "${query}". Estimate values based on standard data if specific brand data isn't exact.
     Also suggest 3 specific healthier alternative products.`;
  }

  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: productSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    
    const imageUrl = offData?.image_front_url || offData?.image_url || `https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(data.name)}`;

    return {
      ...data,
      id: crypto.randomUUID(),
      imageUrl: imageUrl
    };
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

    Return the target daily calories, protein (g), carbs (g), and fats (g).
    Strictly JSON format matching the schema.
  `;

  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dailyGoalsSchema,
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Gemini Diet Plan Generation Error:", error);
    if (error.message === 'API_KEY_MISSING') throw error;
    throw new Error(error.message || "Failed to generate diet plan.");
  }
};