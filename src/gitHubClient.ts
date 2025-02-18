import axios from 'axios';

export class GitHubClient {
    private token: string;
    private repo: string;
    private owner: string;

    constructor(token: string, owner: string, repo: string) {
        this.token = token;
        this.owner = owner;
        this.repo = repo;
    }

    async getPRDiff(prNumber: number): Promise<string> {
        try {
            const url = `https://api.github.com/repos/${this.owner}/${this.repo}/pulls/${prNumber}`;
            const response = await axios.get(url, {
                headers: { Authorization: `token ${this.token}` }
            });
            return response.data.diff_url;
        }
        catch (error) {
            console.error('Error getting PR diff:', error);
            throw error;
        }
    }

    async createReview(prNumber: number, comment: string, inlineComments: Array<{
        path: string;
        position: number;
        body: string;
    }> = []): Promise<void> {
        try {
            const url = `https://api.github.com/repos/${this.owner}/${this.repo}/pulls/${prNumber}/reviews`;
            await axios.post(
                url,
                {
                    body: comment,
                    event: 'COMMENT',
                    comments: inlineComments,
                },
                {
                    headers: {
                        Authorization: `token ${this.token}`,
                        Accept: 'application/vnd.github.v3+json'
                    }
                }
            );
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    }
}