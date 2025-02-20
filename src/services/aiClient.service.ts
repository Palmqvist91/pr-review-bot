import OpenAI from 'openai';
import { ReviewFeedback } from '../types/index.types';

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
                        Focus only on the most critical feedback - things that could cause bugs, performance issues, or maintainability problems.
                        Don't comment on minor style issues or small suggestions.
                        
                        Provide inline feedback with a conversational tone, as if you were talking to a colleague.
                        Use phrases like:
                        - 'This could potentially cause issues because...'
                        - 'We might want to reconsider this approach because...'
                        - 'This is a critical point to consider...'
                        
                        Add emojis to your comments to make them more engaging.
    
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