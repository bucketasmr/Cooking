import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(200).json({ error: 'ОШИБКА: Не задан GEMINI_API_KEY в настройках Vercel!' });
        }

        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) {}
        }

        const ingredients = body?.ingredients;
        const lang = body?.lang || 'ru';

        if (!ingredients) {
            return res.status(200).json({ error: 'Пожалуйста, введите ингредиенты!' });
        }

        const ai = new GoogleGenAI({ apiKey });

        const isRussian = lang === 'ru';
        const basePrompt = isRussian ? 
            `Создай семейный рецепт блюда из этих ингредиентов: ${ingredients}. Формат: Название, Время, Ингредиенты, Шаги, Советы шефа.` : 
            `Create a family recipe using: ${ingredients}. Format: Title, Time, Ingredients, Steps, Chef's Tips.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: basePrompt,
        });

        const textOutput = response.text || (typeof response.text === 'function' ? response.text() : JSON.stringify(response));

        return res.status(200).json({ recipe: textOutput });
    } catch (error) {
        console.error("Catch error:", error);
        return res.status(200).json({ error: `Ошибка бэкенда: ${error.message || error.toString()}` });
    }
}
