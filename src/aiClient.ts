import OpenAI from 'openai';

interface ReviewComment {
    path: string;
    position: number;
    body: string;
}

interface ReviewFeedback {
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
                        content: `You are a friendly, experienced software developer reviewing code changes for a teammate.
                        Provide inline feedback with a conversational tone, as if you were talking to a colleague.
                        Focus on clarity, helpfulness, and a human touch. Use phrases like:
                        - 'Nice work here!'
                        - 'I wonder if we could...'
                        - 'What do you think about...'
                        - 'This looks great, but maybe we could...'
    
                        Respond as a JSON object with an array called 'inlineComments', where each comment has:
                          [
                            {
                              "path": "src/file.ts",
                              "position": 3,
                              "body": "Hey, what do you think about adding a test here?"
                            }
                          ]
                        `
                    },
                    {
                        role: 'user',
                        content: `Here's the code diff:\n${diff}`
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
            });

            const content = response.choices[0].message.content;
            if (!content) {
                return { inlineComments: [] };
            }

            const parsedResponse = JSON.parse(content);
            return {
                inlineComments: Array.isArray(parsedResponse.inlineComments) ? parsedResponse.inlineComments : []
            };
        } catch (error) {
            console.error('Error analyzing code diff:', error);
            throw error;
        }
    }
}    