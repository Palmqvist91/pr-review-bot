import axios from 'axios';
import * as jwt from 'jsonwebtoken';

export class GitHubClient {
    private token: string | null;
    private repo: string;
    private owner: string;
    private baseUrl: string;
    private appId?: number;
    private privateKey?: string;

    constructor(
        tokenOrConfig: {
            appId: number;
            privateKey: string;
        } | string,
        owner: string,
        repo: string
    ) {
        if (typeof tokenOrConfig === 'string') {
            this.token = tokenOrConfig;
            this.appId = undefined;
            this.privateKey = undefined;
        } else {
            this.token = null;
            this.appId = tokenOrConfig.appId;
            this.privateKey = tokenOrConfig.privateKey;
        }

        this.owner = owner;
        this.repo = repo;
        this.baseUrl = 'https://api.github.com';
    }

    private generateJWT(): string {
        if (!this.appId || !this.privateKey) {
            throw new Error('App ID and Private Key are required for GitHub App authentication');
        }

        return jwt.sign(
            {
                iat: Math.floor(Date.now() / 1000) - 60,
                exp: Math.floor(Date.now() / 1000) + (10 * 60),
                iss: this.appId
            },
            this.privateKey,
            { algorithm: 'RS256' }
        );
    }

    private async getInstallationToken(): Promise<string> {
        if (!this.appId) {
            throw new Error('App ID is required for GitHub App authentication');
        }

        const jwt = this.generateJWT();
        const response = await axios.get(
            `${this.baseUrl}/repos/${this.owner}/${this.repo}/installation`,
            {
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            }
        );

        const tokenResponse = await axios.post(
            `${this.baseUrl}/app/installations/${response.data.id}/access_tokens`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            }
        );

        return tokenResponse.data.token;
    }

    private async request(method: string, path: string, data?: any) {
        const url = `${this.baseUrl}${path}`;
        const token = this.token || await this.getInstallationToken();

        try {
            const response = await axios({
                method,
                url,
                data,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error(`GitHub API Error (${method} ${path}):`, error.response?.data || error.message);
            throw error;
        }
    }

    async getPRDiff(prNumber: number): Promise<string> {
        const path = `/repos/${this.owner}/${this.repo}/pulls/${prNumber}`;
        const prData = await this.request('GET', path);
        const diffResponse = await axios.get(prData.diff_url, {
            headers: { 'Accept': 'application/vnd.github.v3.diff' }
        });
        return diffResponse.data;
    }

    async createReview(prNumber: number, comments: Array<{ path: string; position: number; body: string }>) {
        const path = `/repos/${this.owner}/${this.repo}/pulls/${prNumber}/reviews`;
        const payload = {
            body: "Here's some friendly feedback from your AI PR bot! 😊",
            event: "COMMENT",
            comments: comments
        };

        await this.request('POST', path, payload);
    }
}