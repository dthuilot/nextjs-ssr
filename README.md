# nextjs-ssr

Next.js SSR application deployed on AWS Lambda (SSR) + S3/CloudFront (static assets).

## Architecture

```
Browser
  │
  └─► CloudFront distribution
        ├── /_next/static/* → S3 bucket   (static assets, immutable cache)
        ├── /public/*       → S3 bucket   (public files)
        └── /*              → API Gateway → Lambda (SSR, dynamic rendering)
```

## Local development

```bash
npm install
npm run dev        # dev server with hot reload on http://localhost:3000
```

## Testing SSR locally (production mode)

Two options:

**Option 1 – `next start`** (simplest):
```bash
npm run build
npm run start      # production Next.js server on http://localhost:3000
```

**Option 2 – standalone server** (closest to Lambda behavior):
```bash
npm run build
npm run local:lambda   # standalone server on http://localhost:3001
```

Reload the page and watch the timestamp change — that confirms SSR is active.

## Deployment

### Prerequisites

Set the following **GitHub Actions variables** (`Settings → Variables`):

| Variable               | Example                          |
|------------------------|----------------------------------|
| `AWS_REGION`           | `eu-west-1`                      |
| `S3_BUCKET`            | `my-app-static`                  |
| `CLOUDFRONT_DIST_ID`   | `E1234ABCDEF`                    |
| `CLOUDFRONT_URL`       | `https://d1234.cloudfront.net`   |
| `LAMBDA_FUNCTION_NAME` | `nextjs-ssr-handler`             |

And the following **GitHub Actions secrets**:

| Secret                    |
|---------------------------|
| `AWS_ACCESS_KEY_ID`       |
| `AWS_SECRET_ACCESS_KEY`   |

### AWS resources to provision

1. **S3 bucket** – origin for static assets (block public access, use CloudFront OAC)
2. **Lambda function** – Node.js 20.x runtime, handler: `handler.handler`, ~512 MB memory, 30 s timeout
3. **API Gateway (HTTP API)** – proxy all routes to the Lambda function
4. **CloudFront distribution** – two origins:
   - S3 origin for `/_next/static/*` and `/` (static files)
   - API Gateway origin for everything else (SSR)

### Manual deploy

```bash
# Static assets
S3_BUCKET=my-bucket CLOUDFRONT_DIST_ID=EXXX bash scripts/deploy-static.sh

# Lambda (after npm run build)
cp lambda/handler.js .next/standalone/handler.js
cd .next/standalone && zip -r ../../lambda-package.zip .
aws lambda update-function-code \
  --function-name nextjs-ssr-handler \
  --zip-file fileb://lambda-package.zip
```

## Project structure

```
.
├── src/app/            # Next.js App Router pages
├── lambda/
│   └── handler.js      # Lambda entry point (wraps Next.js with serverless-http)
├── scripts/
│   ├── local-lambda.js # Run standalone server locally (simulates Lambda)
│   └── deploy-static.sh # Upload static assets to S3
└── .github/workflows/
    ├── ci.yml          # Build + lint on every push/PR
    └── deploy.yml      # Deploy to AWS on push to main
```
