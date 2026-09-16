import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'CRITICAL: GEMINI_API_KEY is missing in Vercel environment variables!' });
        }

        const { ingredients, lang } = req.body;

        if (!ingredients) {
            return res.status(400).json({ error: 'Ingredients are required' });
        }

        const isRussian = lang === 'ru';

        const basePrompt = isRussian ? 
            `Ты — эксперт-семейный шеф-повар и профессиональный диетолог. Создай вкусный, сбалансированный и полезный для детей рецепт блюда из этих ингредиентов: ${ingredients}. Формат ответа: Название, Время, Ингредиенты, Шаги, Советы шефа.` : 
            `Act as an expert family chef and professional nutritionist. Create a toddler-safe recipe using: ${ingredients}. Format: Title, Time, Ingredients, Steps, Chef's Tips.`;

        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: basePrompt,
        });

        const textOutput = response.text || (typeof response.text === 'function' ? response.text() : JSON.stringify(response));

        return res.status(200).json({ recipe: textOutput });
    } catch (error) {
        console.error("Detailed server error:", error);
        return res.status(500).json({ error: `SDK Error: ${error.message || error.toString()}` });
    }
}
