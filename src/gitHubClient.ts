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

        try {
            console.log('Fetching installations...');
            const installationsResponse = await axios.get(
                `${this.baseUrl}/app/installations`,
                {
                    headers: {
                        'Authorization': `Bearer ${jwt}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                }
            );

            console.log(`Found ${installationsResponse.data.length} installations`);
            console.log('Looking for installation for:', this.owner);

            const installation = installationsResponse.data.find((inst: any) =>
                inst.account.login.toLowerCase() === this.owner.toLowerCase()
            );

            if (!installation) {
                throw new Error(`No installation found for ${this.owner}/${this.repo}`);
            }

            const tokenResponse = await axios.post(
                `${this.baseUrl}/app/installations/${installation.id}/access_tokens`,
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
        } catch (error: any) {
            console.error('Error getting installation token:', error.response?.data || error.message);
            throw error;
        }
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
        try {
            console.log(`Fetching PR #${prNumber} data...`);
            console.log(`Owner: ${this.owner}, Repo: ${this.repo}`);

            const path = `/repos/${this.owner}/${this.repo}/pulls/${prNumber}`;
            console.log('Making request to:', `${this.baseUrl}${path}`);

            const prData = await this.request('GET', path);
            console.log('PR data:', {
                number: prData.number,
                state: prData.state,
                title: prData.title,
                diff_url: prData.diff_url
            });

            console.log('Fetching diff from:', prData.diff_url);
            const diffResponse = await axios.get(prData.diff_url, {
                headers: {
                    'Accept': 'application/vnd.github.v3.diff',
                    'Authorization': `Bearer ${this.token || await this.getInstallationToken()}`
                }
            });

            return diffResponse.data;
        } catch (error: any) {
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });
            throw error;
        }
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