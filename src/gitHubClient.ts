import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/core";

export class GitHubClient {
    private octokit: Octokit;
    private owner: string;
    private repo: string;
    private token: string | null = null;

    constructor(owner?: string, repo?: string) {
        this.owner = owner || process.env.GITHUB_OWNER || "";
        this.repo = repo || process.env.GITHUB_REPO || "";

        if (!this.owner || !this.repo) {
            throw new Error("Owner and repo must be defined either in the constructor or as environment variables.");
        }

        const appId = process.env.GH_APP_ID;
        const privateKey = process.env.GH_APP_PRIVATE_KEY;

        if (!appId || !privateKey) {
            throw new Error("GH_APP_ID and GH_APP_PRIVATE_KEY must be defined in environment variables.");
        }

        this.octokit = new Octokit({
            authStrategy: createAppAuth,
            auth: {
                appId: Number(appId),
                privateKey,
            }
        });
    }

    private async getInstallationToken(): Promise<string> {
        if (this.token) return this.token;

        try {
            const { data: installations } = await this.octokit.request("GET /app/installations");

            if (installations.length === 0) {
                throw new Error("No installations found for the GitHub App.");
            }

            const installationId = installations[0].id;
            console.log("Using Installation ID:", installationId);

            const { data } = await this.octokit.request(`POST /app/installations/${installationId}/access_tokens`);
            this.token = data.token;

            return this.token as string;
        } catch (error) {
            console.error("Error fetching installation token:", error);
            throw error;
        }
    }

    async getPRDiff(prNumber: number): Promise<string> {
        try {
            const token = await this.getInstallationToken();

            const { data } = await this.octokit.request(`GET /repos/${this.owner}/${this.repo}/pulls/${prNumber}`);

            return data.diff_url;
        } catch (error) {
            console.error("Error fetching PR diff:", error);
            throw error;
        }
    }

    async createReview(prNumber: number, comments: Array<{ path: string; position: number; body: string }>) {
        try {
            const token = await this.getInstallationToken();

            const { data } = await this.octokit.request(`POST /repos/${this.owner}/${this.repo}/pulls/${prNumber}/reviews`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.v3+json",
                },
                body: "Here's some friendly feedback from your PR bot! 😊",
                event: "COMMENT",
                comments: comments
            });

            console.log("Review created:", data);
        } catch (error) {
            console.error("Error creating PR review:", error);
            throw error;
        }
    }
}