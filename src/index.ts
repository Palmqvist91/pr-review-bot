import { GitHubClient } from './gitHubClient.js';
import { AIClient } from './aiClient.js';
import { ReviewProcessor } from './reviewProcessor.js';

const openAiKey = process.env.OPENAI_API_KEY;
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];

if (!openAiKey || !owner || !repo) {
    console.error('GitHub Secrets saknas!');
    console.error('Se till att följande secrets är konfigurerade i GitHub repository:');
    console.error('- OPENAI_API_KEY');
    console.error('- GH_APP_ID');
    console.error('- GH_APP_PRIVATE_KEY');
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
