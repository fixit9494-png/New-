import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface MassagePlace {
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  types: string[];
  mapsUri: string;
  snippets?: string[];
}

export async function searchMassageServices(location?: { latitude: number; longitude: number }): Promise<{ text: string; places: MassagePlace[] }> {
  const prompt = "Find highly-rated full service massage parlors and spas nearby. Provide a brief summary of why they are good.";
  
  const config: any = {
    tools: [{ googleMaps: {} }],
  };

  if (location) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },
    };
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config,
  });

  const text = response.text;
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const places: MassagePlace[] = groundingChunks
    .filter((chunk: any) => chunk.maps)
    .map((chunk: any) => ({
      name: chunk.maps.title,
      address: chunk.maps.address || "",
      rating: chunk.maps.rating,
      userRatingsTotal: chunk.maps.userRatingsTotal,
      priceLevel: chunk.maps.priceLevel,
      types: chunk.maps.types || [],
      mapsUri: chunk.maps.uri,
      snippets: chunk.maps.placeAnswerSources?.map((s: any) => s.reviewSnippets).flat().filter(Boolean) || [],
    }));

  return { text, places };
}
