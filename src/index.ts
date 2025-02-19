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
    console.error('Missing environment variables:');
    console.error('- GH_APP_ID:', !!process.env.GH_APP_ID);
    console.error('- GH_APP_PRIVATE_KEY:', !!process.env.GH_APP_PRIVATE_KEY);
    console.error('- OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);
    console.error('- REPO_OWNER:', !!process.env.REPO_OWNER);
    console.error('- REPO_NAME:', !!process.env.REPO_NAME);
    process.exit(1);
}

const prNumber = Number(process.argv[2]);

if (!prNumber) {
    console.error('PR number must be provided!');
    process.exit(1);
}

(async () => {
    try {
        console.log('Initializing with:');
        console.log('- Owner:', owner);
        console.log('- Repo:', repo);
        console.log('- PR:', prNumber);

        const githubClient = new GitHubClient({ appId, privateKey }, owner, repo);
        const aiClient = new AIClient(openAiKey);
        const reviewProcessor = new ReviewProcessor(githubClient, aiClient);

        await reviewProcessor.processReview(prNumber);
    } catch (error) {
        console.error('Error in main process:', error);
        process.exit(1);
    }
})();