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
        const lang = body?.lang || 'en';
        const count = Number(body?.count) || 1;

        if (!ingredients) {
            return res.status(200).json({ error: lang === 'ru' ? 'Пожалуйста, введите ингредиенты!' : 'Please enter ingredients!' });
        }

        const ai = new GoogleGenAI({ apiKey });
        const isRussian = lang === 'ru';
        
        const basePrompt = isRussian ? 
            `Составь ${count} РАЗНЫХ семейных блюд из всего, что есть на кухне: ${ingredients}. Комбинируй их по-разному с базовыми продуктами (масло, специи, лук), добиваясь максимального разнообразия стилей (суп, запеканка, вок, салат, горячее и т.д.). Для каждого блюда укажи: Название, Время, Ингредиенты, Шаги, Совет шефа. Разделяй блюда через '---'.` : 
            `Create ${count} DIFFERENT family recipes using available kitchen items: ${ingredients}. Combine creatively with pantry staples for maximum style variety (soup, bake, stir-fry, salad, bowl, etc.). For each dish provide: Title, Time, Ingredients, Steps, Chef's Tip. Separate dishes with '---'.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: basePrompt,
        });

        const textOutput = response.text || '';
        
        if (!textOutput.trim()) {
            return res.status(200).json({ error: isRussian ? 'Модель вернула пустой ответ. Попробуйте изменить список ингредиентов.' : 'Model returned empty response. Try updating ingredients.' });
        }

        return res.status(200).json({ recipe: textOutput });
    } catch (error) {
        console.error("Catch error:", error);
        return res.status(200).json({ error: `Backend error: ${error.message || error.toString()}` });
    }
}
