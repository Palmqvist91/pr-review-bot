import { GitHubClient } from './gitHubClient';
import { AIClient } from './aiClient';
import { calculateDiffPositions, isValidDiff } from './calculateDiff';

export class ReviewProcessor {
    constructor(
        private githubClient: GitHubClient,
        private aiClient: AIClient
    ) { }

    async processReview(prNumber: number) {
        try {
            console.log(`Starting review for PR #${prNumber}`);

            const diff = await this.githubClient.getPRDiff(prNumber);
            if (!isValidDiff(diff)) {
                console.warn('Invalid diff format received');
                return;
            }

            console.log('Analyzing diff with AI...');
            const rawComments = await this.aiClient.analyzeCodeDiff(diff);
            const validComments = calculateDiffPositions(diff, rawComments.inlineComments);

            console.log('Raw comments:', rawComments);
            console.log('Processed inline comments:', validComments);

            if (validComments.length === 0) {
                console.log('No valid comments to post.');
                return;
            }

            console.log('Creating review on PR...');
            await this.githubClient.createReview(prNumber, validComments);

            console.log('Review completed successfully!');
        } catch (error) {
            console.error('Error during review process:', error);
        }
    }
}
