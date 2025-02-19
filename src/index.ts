import dotenv from 'dotenv';
import { GitHubClient } from './gitHubClient';
import { AIClient } from './aiClient';
import { ReviewProcessor } from './reviewProcessor';

dotenv.config();

const appId = Number(process.env.GH_APP_ID);
const privateKey = process.env.GH_APP_PRIVATE_KEY;
const openAiKey = process.env.OPENAI_API_KEY;
const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;

if (!appId || !privateKey || !openAiKey || !owner || !repo) {
    console.error('Environment variables are missing! Please check the configuration.');
    process.exit(1);
}

const prNumber = Number(process.argv[2]);

(async () => {
    const githubClient = new GitHubClient({ appId, privateKey }, owner, repo);
    const aiClient = new AIClient(openAiKey);
    const reviewProcessor = new ReviewProcessor(githubClient, aiClient);

    if (!prNumber) {
        console.error('PR number must be provided!');
        process.exit(1);
    }

    await reviewProcessor.processReview(prNumber);
})();