import dotenv from 'dotenv';
import { GitHubClient } from './gitHubClient';
import { AIClient } from './aiClient';
import { ReviewProcessor } from './reviewProcessor';

dotenv.config();

//TODO: Create file structure for this project

const openAiKey = process.env.OPENAI_API_KEY;
const owner = process.env.GITHUB_OWNER || process.env.REPO_OWNER;
const repo = process.env.GITHUB_REPO || process.env.REPO_NAME;

if (!openAiKey || !owner || !repo) {
    console.error('Environment variables are missing! Please check the .env file or GitHub Secrets.');
    process.exit(1);
}

const prNumber = Number(process.argv[2]);

(async () => {
    if (!prNumber) {
        console.error('PR number must be provided!');
        process.exit(1);
    }

    const githubClient = new GitHubClient(owner, repo);
    const aiClient = new AIClient(openAiKey);
    const reviewProcessor = new ReviewProcessor(githubClient, aiClient);

    await reviewProcessor.processReview(prNumber);
})();
