#!/usr/bin/env node

import dotenv from 'dotenv';
import { GitHubClient } from './services/gitHubClient.service';
import { AIClient } from './services/aiClient.service';
import { ReviewProcessor } from './services/reviewProcessor.service';

dotenv.config();

const args = process.argv.slice(2);
const command = args[0];
const prNumberArg = args[1];
const prNumber = Number(prNumberArg);

if (command !== 'review' || !prNumberArg || isNaN(prNumber) || prNumber <= 0) {
    console.error('Usage: pr-review-bot review <pr-number>');
    console.error('PR number must be provided and must be a valid positive number!');
    process.exit(1);
}

const appId = process.env.GH_APP_ID;
const privateKey = process.env.GH_APP_PRIVATE_KEY?.replace(/\\n/g, '\n');
const installationId = process.env.GH_INSTALLATION_ID;
const openAiKey = process.env.OPENAI_API_KEY;
const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;

if (!appId || !privateKey || !installationId || !openAiKey || !owner || !repo) {
    console.error('Environment variables are missing! Please check the configuration.');
    process.exit(1);
}

(async () => {
    try {
        const githubClient = new GitHubClient(appId, privateKey, owner, repo);
        const aiClient = new AIClient(openAiKey);
        const reviewProcessor = new ReviewProcessor(githubClient, aiClient);

        await reviewProcessor.processReview(prNumber);
        console.log(`Review completed for PR #${prNumber}`);
    } catch (error: unknown) {
        console.error('Error processing review:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
})();