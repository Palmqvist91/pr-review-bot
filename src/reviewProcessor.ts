import { GitHubClient } from './gitHubClient';
import { AIClient } from './aiClient';

export class ReviewProcessor {
    constructor(
        private githubClient: GitHubClient,
        private aiClient: AIClient
    ) { }

    async processReview(prNumber: number, dryRun: boolean) {
        try {
            console.log(`Starting review for PR #${prNumber}`);

            const diffUrl = await this.githubClient.getPRDiff(prNumber);
            const diffResponse = await fetch(diffUrl);
            const diff = await diffResponse.text();

            console.log('Analyzing diff with AI...');
            const feedback = await this.aiClient.analyzeCodeDiff(diff);

            console.log('AI Feedback:', feedback);

            if (!dryRun) {
                console.log('Creating review on PR...');
                await this.githubClient.createReview(
                    prNumber,
                    feedback.summary,
                    feedback.inlineComments
                );
            }

            console.log('Review completed successfully!');
        } catch (error) {
            console.error('Error during review process:', error);
            throw error;
        }
    }
}
