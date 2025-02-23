# PR Review Bot

## Release notes (1.0.3)

- Updated README including instructions for using the bot with a GitHub App.
- Added images to the README.
## Description

PR Review Bot is a GitHub bot that automatically reviews pull requests and provides feedback using OpenAI's GPT-4. The bot is designed to focus on critical issues that may cause bugs, performance problems, or maintenance issues, and avoids minor style issues.

![PR Review Bot Preview](./dist/public/img/preview.png)

## Features

- **Automatic Code Review**: Uses AI to analyze code changes and generate feedback.
- **Integration with GitHub**: Fetches diffs from pull requests and posts comments directly on GitHub.
- **Configurable**: Customize the bot's behavior through environment variables and GitHub Actions.

## Installation

Ensure you have Node.js installed.

To install the package from npm, use the following command:

```bash
npm install pr-review-bot@latest
```

## Using PR Review Bot with a GitHub App

To use PR Review Bot, you need to create and configure your own GitHub App. Follow these steps:

1. **Create a GitHub App**:
   - Go to `Settings > Developer settings > GitHub Apps` on GitHub.
   - Click **New GitHub App**, and fill in the details:
     - **App name**: e.g., "MyPRReviewBot"
     - **Homepage URL**: Your GitHub repository or website (e.g., `https://github.com/Palmqvist91/pr-review-bot`).
     - **Permissions**:
       - **Pull Requests**: Read and write
       - **Contents**: Read
       - **Metadata**: Read
     - **Subscribe to events**: Select `Pull Request` and `Push` (optional).
   - Generate a private key and note the App ID.

2. **Install the App**:
   - Install the app in your repository via `Settings > Integrations and services > GitHub Apps`, or use the GitHub API to install it programmatically.
   - After installation, note the `Installation ID` for your repository.

3. **Configure Environment Variables**:
   - Set the following environment variables in your workflow or `.env` file:

   ```
   GH_APP_ID=your_github_app_id
   GH_APP_PRIVATE_KEY=your_private_key
   GH_INSTALLATION_ID=your_installation_id
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Create a GitHub Actions workflow in your repository.

```yaml

name: PR Review Bot

on:
  pull_request:
    types: [opened, synchronize]
    branches:
      - main

jobs:
  ai_pr_review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install PR Review Bot
        run: npm install pr-review-bot@latest

      - name: Run PR Review Bot
        run: npx pr-review-bot review ${{ github.event.pull_request.number }}
        env:
          GH_APP_ID: ${{ secrets.GH_APP_ID }}
          GH_APP_PRIVATE_KEY: ${{ secrets.GH_APP_PRIVATE_KEY }}
          GH_INSTALLATION_ID: ${{ secrets.GH_INSTALLATION_ID }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          REPO_OWNER: ${{ github.repository_owner }}
          REPO_NAME: ${{ github.event.repository.name }}

```

## License

This project is licensed under the MIT license. See [LICENSE](LICENSE) for more information.

## Author

PrHiGo