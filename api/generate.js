import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { ingredients, lang } = req.body;

    if (!ingredients) {
        return res.status(400).json({ error: 'Ingredients are required' });
    }

    // Выбираем язык промта в зависимости от выбора пользователя
    const isRussian = lang === 'ru';

    const basePrompt = isRussian ? 
        `Ты — эксперт-семейный шеф-повар и профессиональный диетолог. Создай вкусный, сбалансированный и полезный для детей рецепт блюда, который подходит как для взрослых, так и для маленького ребенка (безопасно для малышей). 
        
        Убедись, что рецепт соответствует критериям:
        1. **Вкус и привлекательность:** Вкусно для взрослых, но мягко и приятно для ребенка.
        2. **Безопасность и текстура:** Безопасно для детей (без риска подавиться, мягкая текстура, без избыточной остроты).
        3. **Баланс:** Хорошее сочетание белков, полезных жиров и овощей.
        4. **Простота:** Понятные пошаговые инструкции.

        Формат ответа:
        - **Название рецепта**
        - **Время подготовки / Время готовки / Порции**
        - **Список ингредиентов**
        - **Пошаговая инструкция**
        - **Советы шефа для детей:** (как адаптировать порцию для ребенка)

        Вот мои ингредиенты: ${ingredients}` : 
        
        `Act as an expert family chef and professional nutritionist. Create a delicious, balanced, and kid-friendly meal recipe suitable for both adults and a young child (toddler-safe). 

        Please ensure the recipe meets the following criteria:
        1. **Taste & Appeal:** Delicious, flavorful, and satisfying for adults, but mild and appealing enough for a child.
        2. **Safety & Texture:** Safe for children (no choking hazards, easily chewable textures, and no excessive spicy heat).
        3. **Nutritional Balance:** Includes a good mix of proteins, healthy fats, and vegetables.
        4. **Simplicity:** Uses clear step-by-step instructions.

        Provide the response in the following format:
        - **Recipe Title**
        - **Prep Time / Cook Time / Servings**
        - **Ingredients List**
        - **Step-by-Step Instructions**
        - **Chef's Tips for Kids:** (how to modify a portion for a child)

        Here are the ingredients I have: ${ingredients}`;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: basePrompt,
        });

        return res.status(200).json({ recipe: response.text });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
