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

    async createReview(prNumber: number, comments: Array<{ path: string; position: number; body: string }>) {
        const url = `https://api.github.com/repos/${this.owner}/${this.repo}/pulls/${prNumber}/reviews`;

        const payload = {
            body: "Here's some friendly feedback from your AI PR bot! 😊",
            event: "COMMENT",
            comments: comments
        };

        try {
            await axios.post(url, payload, {
                headers: {
                    Authorization: `token ${this.token}`,
                    Accept: "application/vnd.github.v3+json"
                }
            });
        } catch (error: any) {
            console.error('Error creating review:', error.response?.data || error.message);
            throw error;
        }
    }
}