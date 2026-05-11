import axios from "axios"

export const askAi = async (messages) => {
    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty.");
        }
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",
                messages: messages

            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });

        const content = response?.data?.choices?.[0]?.message?.content;

        if (!content || !content.trim()) {
            throw new Error("AI returned empty response.");
        }

        return content
    } catch (error) {
        console.error("OpenRouter Error:", error.response?.data || error.message);
        throw new Error("OpenRouter API Error");
    }
}

export const askAiStream = async (messages, onChunk) => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: messages,
                stream: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter Stream Error: ${response.status} - ${errorText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
                const line = buffer.slice(0, newlineIndex).trim();
                buffer = buffer.slice(newlineIndex + 1);

                if (line.startsWith("data: ")) {
                    const dataStr = line.slice(6);
                    if (dataStr === "[DONE]") continue;

                    try {
                        const data = JSON.parse(dataStr);
                        const content = data.choices[0]?.delta?.content || "";
                        if (content) {
                            fullText += content;
                            onChunk(content);
                        }
                    } catch (e) {
                        // ignore malformed JSON that slipped through
                    }
                }
            }
        }
        return fullText;
    } catch (error) {
        console.error("Stream Helper Error:", error.message);
        throw error;
    }
};