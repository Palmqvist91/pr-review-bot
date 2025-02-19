import { GitHubClient } from './gitHubClient.js';
import { AIClient } from './aiClient.js';
import { calculateDiffPositions } from './calculateDiff.js';

export class ReviewProcessor {
    constructor(
        private githubClient: GitHubClient,
        private aiClient: AIClient
    ) {
        this.githubClient = new GitHubClient(process.env.GITHUB_OWNER as string, process.env.GITHUB_REPO as string);
        this.aiClient = new AIClient(process.env.OPENAI_API_KEY as string);
    }

    async processReview(prNumber: number) {
        try {
            console.log(`Starting review for PR #${prNumber}`);

            const diffUrl = await this.githubClient.getPRDiff(prNumber);
            const diffResponse = await fetch(diffUrl);
            const diff = await diffResponse.text();

            console.log('Analyzing diff with AI...');
            const rawComments = await this.aiClient.analyzeCodeDiff(diff);
            const inlineComments = calculateDiffPositions(diff, rawComments.inlineComments);

            console.log('Raw comments:', rawComments);
            console.log('Processed inline comments:', inlineComments);

            if (inlineComments.length === 0) {
                console.log('No valid comments to post.');
                return;
            }

            console.log('Creating review on PR...');
            await this.githubClient.createReview(prNumber, inlineComments);

            console.log('Review completed successfully!');
        } catch (error) {
            console.error('Error during review process:', error);
        }
    }
}
