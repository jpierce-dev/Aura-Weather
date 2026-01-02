import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData } from "../types";

const apiKey = process.env.API_KEY;
// Safe initialization - if no key, we handle gracefully in the component
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateWeatherSummary = async (data: WeatherData, city: string): Promise<{ summary: string, clothing: string }> => {
  if (!ai) {
    return {
      summary: "AI services unavailable (Missing API Key).",
      clothing: "Dress appropriately for the weather."
    };
  }

  const model = "gemini-3-flash-preview";

  const prompt = `
    You are a witty weather assistant. 
    Location: ${city}.
    Current Temp: ${data.current.temperature}°C.
    Condition Code: ${data.current.weatherCode}.
    Wind: ${data.current.windSpeed} km/h.
    Today's Max: ${data.daily.temperature_2m_max[0]}°C, Min: ${data.daily.temperature_2m_min[0]}°C.
    Rain Probability next few hours: ${data.hourly.precipitation_probability.slice(0, 5).join(', ')}%.

    Provide a JSON response with two fields:
    1. "summary": A 1-sentence witty summary of the weather.
    2. "clothing": A short clothing recommendation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            clothing: { type: Type.STRING },
          },
          required: ["summary", "clothing"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response text");
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "Enjoy the weather today!",
      clothing: "Check the forecast before heading out."
    };
  }
};