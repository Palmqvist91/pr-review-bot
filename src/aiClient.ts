import OpenAI from 'openai';

interface ReviewComment {
    path: string;
    position: number;
    body: string;
}

interface ReviewFeedback {
    summary: string;
    inlineComments: ReviewComment[];
}

export class AIClient {
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({ apiKey });
    }

    async analyzeCodeDiff(diff: string): Promise<ReviewFeedback> {
        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `You are a code reviewer. Analyze the code diff and provide:
                    1. A short contextual inline comments for each significant change
                    Format your response as JSON with 'summary' and 'inlineComments' fields.
                    For inlineComments, include 'path', 'position' (line number), and 'body'.`
                    },
                    {
                        role: 'user',
                        content: `Here is the code diff:\n${diff}`
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
            });

            const content = response.choices[0].message.content;
            if (!content) {
                return {
                    summary: "No feedback generated",
                    inlineComments: []
                };
            }

            try {
                const parsedResponse = JSON.parse(content);
                return {
                    summary: parsedResponse.summary || "No summary provided",
                    inlineComments: Array.isArray(parsedResponse.inlineComments)
                        ? parsedResponse.inlineComments
                        : []
                };
            } catch (parseError) {
                console.error('Failed to parse AI response:', content);
                throw new Error('Invalid AI response format');
            }
        } catch (error) {
            console.error('Error analyzing code diff:', error);
            throw error;
        }
    }
}