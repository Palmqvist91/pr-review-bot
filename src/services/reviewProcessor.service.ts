import { GitHubClient } from './gitHubClient.service';
import { AIClient } from './aiClient.service';
import { calculateDiffPositions, isValidDiff } from '../utils/calculateDiff.util';

export class ReviewProcessor {
    constructor(
        private githubClient: GitHubClient,
        private aiClient: AIClient
    ) { }

    async processReview(prNumber: number) {
        try {
            const diff = await this.githubClient.getPRDiff(prNumber);
            if (!isValidDiff(diff)) {
                console.warn('Invalid diff format received');
                return;
            }

            const rawComments = await this.aiClient.analyzeCodeDiff(diff);
            const validComments = calculateDiffPositions(diff, rawComments.inlineComments);

            if (validComments.length === 0) {
                console.log('No valid comments to post.');
                return;
            }

            await this.githubClient.createReview(prNumber, validComments);

            console.log('Review completed successfully!');
        } catch (error) {
            console.error('Error during review process:', error);
        }
    }
}
