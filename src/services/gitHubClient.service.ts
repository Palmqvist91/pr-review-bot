import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

export class GitHubClient {
    private octokit: Octokit;

    constructor(
        appId: string,
        privateKey: string,
        private owner: string,
        private repo: string
    ) {
        const installationId = process.env.GITHUB_INSTALLATION_ID;
        if (!installationId) {
            throw new Error('GITHUB_INSTALLATION_ID is required');
        }

        this.octokit = new Octokit({
            authStrategy: createAppAuth,
            auth: {
                appId,
                privateKey,
                installationId
            }
        });
    }

    async getPRDiff(prNumber: number): Promise<string> {
        try {
            const { data } = await this.octokit.pulls.get({
                owner: this.owner,
                repo: this.repo,
                pull_number: prNumber,
                mediaType: {
                    format: 'diff'
                }
            });

            if (typeof data !== 'string') {
                throw new Error('Unexpected response format from GitHub API');
            }

            return data;
        } catch (error) {
            console.error('Error getting PR diff:', error);
            throw error;
        }
    }

    async createReview(prNumber: number, comments: Array<{ path: string; position: number; body: string }>) {
        try {
            await this.octokit.pulls.createReview({
                owner: this.owner,
                repo: this.repo,
                pull_number: prNumber,
                body: "Here's some friendly feedback from your AI PR bot! 😊",
                event: "COMMENT",
                comments: comments.map(({ path, position, body }) => ({
                    path,
                    position,
                    body
                }))
            });
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    }
}