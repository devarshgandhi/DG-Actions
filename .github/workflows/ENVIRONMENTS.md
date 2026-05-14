# GitHub Environments Setup

Create these repository environments in GitHub under `Settings > Environments`.

## dev

- Name: `dev`
- Protection rules: none required
- Suggested use: automatic deployment from `main`

## stage

- Name: `stage`
- Protection rules: optional required reviewer
- Suggested use: manual validation before production

## prod

- Name: `prod`
- Protection rules: required reviewers
- Suggested use: controlled production deployment

## Suggested environment secrets

Add these repository or environment-scoped secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_LOCATION`

If all three environments share the same Azure target, repository secrets are enough.
If they need different Azure targets, add them as environment-scoped secrets on `dev`, `stage`, and `prod` instead.

The workflows in this repository already pass these environment names to GitHub Actions:

- `dev`
- `stage`
- `prod`

## Azure federated credentials for GitHub OIDC

If you authenticate with Azure using GitHub OIDC, your Microsoft Entra app registration must trust the exact GitHub token subject used by each workflow.

For this repository, create federated identity credentials with these subjects:

- `repo:devarshgandhi/DG-Actions:environment:dev`
- `repo:devarshgandhi/DG-Actions:environment:stage`
- `repo:devarshgandhi/DG-Actions:environment:prod`

Recommended settings for each credential:

- Issuer: `https://token.actions.githubusercontent.com`
- Audience: `api://AzureADTokenExchange`
- Subject: one of the exact values above

The PR preview deployment workflow also authenticates under the GitHub `dev` environment, so Azure must trust `repo:devarshgandhi/DG-Actions:environment:dev` for preview deploys to succeed.
