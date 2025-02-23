# PR Review Bot

## Description

PR Review Bot is a GitHub bot that automatically reviews pull requests and provides feedback using OpenAI's GPT-4. The bot is designed to focus on critical issues that may cause bugs, performance problems, or maintenance issues, and avoids minor style issues.

## Features

- **Automatic Code Review**: Uses AI to analyze code changes and generate feedback.
- **Integration with GitHub**: Fetches diffs from pull requests and posts comments directly on GitHub.
- **Configurable**: Customize the bot's behavior through environment variables and GitHub Actions.

## Installation

### Install from GitHub Packages

To install the package from GitHub Packages, ensure you have configured your `.npmrc` file to authenticate against GitHub Packages. Add the following to your `.npmrc`:

```
@palmqvist91:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then you can install the package with:

```bash
npm install @palmqvist91/pr-review-bot@latest
```

## Usage

1. Set the required environment variables in a `.env` file:
   ```
   GH_APP_ID=your_github_app_id
   GH_APP_PRIVATE_KEY=your_private_key
   GH_INSTALLATION_ID=your_installation_id
   OPENAI_API_KEY=your_openai_api_key
   REPO_OWNER=your_repo_owner
   REPO_NAME=your_repo_name
   ```

2. Run the bot locally:
   ```bash
   npm run dev
   ```

3. To run as a GitHub Action, ensure your `.github/workflows/pr-review.yml` is correctly configured.


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
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com/'

      - name: Install PR Review Bot
        run: npm install @palmqvist91/pr-review-bot@latest
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }} # For authentication against GitHub Packages use your PAT token

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

## Contributing

We welcome contributions! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT license. See [LICENSE](LICENSE) for more information.

## Author

PrHiGo