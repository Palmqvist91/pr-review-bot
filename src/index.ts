import dotenv from 'dotenv';
import { GitHubClient } from './gitHubClient';
import { AIClient } from './aiClient';
import { ReviewProcessor } from './reviewProcessor';

dotenv.config();

const token = process.env.GITHUB_TOKEN;
const openAiKey = process.env.OPENAI_API_KEY;
const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;

if (!token || !openAiKey || !owner || !repo) {
    console.error('Environment variables are missing! Please check the .env file.');
    process.exit(1);
}

const prNumber = Number(process.argv[2]);
const dryRun = process.argv.includes('--dry-run');

(async () => {
    const githubClient = new GitHubClient(token, owner, repo);
    const aiClient = new AIClient(openAiKey);
    const reviewProcessor = new ReviewProcessor(githubClient, aiClient);

    if (!prNumber) {
        console.error('PR number must be provided!');
        process.exit(1);
    }

    if (dryRun) {
        console.log('Running in dry-run mode - no comments will be posted');
    }

    await reviewProcessor.processReview(prNumber, dryRun);
})();