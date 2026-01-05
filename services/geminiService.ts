import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData } from "../types";

const apiKey = process.env.GEMINI_API_KEY;
// Safe initialization - if no key, we handle gracefully in the component
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateWeatherSummary = async (data: WeatherData, city: string): Promise<{ summary: string; clothing: string; airQuality?: string }> => {
  if (!ai) {
    return {
      summary: "AI services unavailable (Missing API Key).",
      clothing: "Dress appropriately for the weather.",
      airQuality: "Check local air quality reports."
    };
  }

  const model = "gemini-2.0-flash-exp";

  const prompt = `
    You are a witty weather assistant. 
    Location: ${city}.
    Current Temp: ${data.current.temperature}°C.
    Condition Code: ${data.current.weatherCode}.
    Wind: ${data.current.windSpeed} km/h.
    AQI: ${data.current.aqi || 'Unknown'}.
    PM2.5: ${data.current.pm2_5 || 'Unknown'}.
    Today's Max: ${data.daily.temperature_2m_max[0]}°C, Min: ${data.daily.temperature_2m_min[0]}°C.
    Rain Probability next few hours: ${data.hourly.precipitation_probability.slice(0, 5).join(', ')}%.

    Provide a JSON response with three fields (MUST BE IN CHINESE):
    1. "summary": A 1-sentence witty summary of the weather in Chinese.
    2. "clothing": A short clothing recommendation in Chinese.
    3. "airQuality": Advice based on current AQI/PM2.5 (e.g., need mask, okay for outdoor) in Chinese.
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
            airQuality: { type: Type.STRING },
          },
          required: ["summary", "clothing", "airQuality"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response text");

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "祝你今天天气愉快！",
      clothing: "出门前请检查天气预报。",
      airQuality: "注意空气质量变化。"
    };
  }
};