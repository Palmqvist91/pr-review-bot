import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/core";

export class GitHubClient {
    private octokit: Octokit;
    private owner: string;
    private repo: string;
    private installationId: number | null = null;
    private token: string | null = null;

    constructor(owner: string, repo: string) {
        this.owner = owner;
        this.repo = repo;

        const appId = process.env.GH_APP_ID;
        let privateKey = process.env.GH_APP_PRIVATE_KEY;

        if (!appId || !privateKey) {
            throw new Error("GH_APP_ID and GH_APP_PRIVATE_KEY must be defined in environment variables.");
        }

        privateKey = privateKey.replace(/\\n/g, "\n");

        this.octokit = new Octokit({
            authStrategy: createAppAuth,
            auth: {
                appId: Number(appId),
                privateKey,
            }
        });
    }

    private async getInstallationId(): Promise<number> {
        if (this.installationId) return this.installationId;

        try {
            const { data: installations } = await this.octokit.request("GET /app/installations");

            if (installations.length === 0) {
                throw new Error("No installations found for the GitHub App.");
            }

            this.installationId = installations[0].id;
            console.log("Using Installation ID:", this.installationId);
            return this.installationId;
        } catch (error) {
            console.error("Error fetching installation ID:", error);
            throw error;
        }
    }

    private async getInstallationToken(): Promise<string> {
        if (this.token) return this.token;

        const installationId = await this.getInstallationId();

        try {
            const { data } = await this.octokit.request(`POST /app/installations/${installationId}/access_tokens`);
            this.token = data.token;

            if (!this.token) {
                throw new Error("Failed to retrieve a valid token.");
            }

            return this.token;
        } catch (error) {
            console.error("Error fetching installation token:", error);
            throw error;
        }
    }

    async getPRDiff(prNumber: number): Promise<string> {
        try {
            const token = await this.getInstallationToken();
            const { data } = await this.octokit.request(`GET /repos/${this.owner}/${this.repo}/pulls/${prNumber}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.v3+json",
                },
            });

            return data.diff_url;
        } catch (error) {
            console.error("Error fetching PR diff:", error);
            throw error;
        }
    }

    async createReview(prNumber: number, comments: Array<{ path: string; position: number; body: string }>) {
        try {
            const installationId = await this.getInstallationId();
            const token = await this.getInstallationToken();

            const { data } = await this.octokit.request(`POST /repos/${this.owner}/${this.repo}/pulls/${prNumber}/reviews`, {
                installation_id: installationId,
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
