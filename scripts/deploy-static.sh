#!/usr/bin/env bash
# Upload Next.js static assets to S3 and invalidate CloudFront cache.
#
# Required env vars:
#   S3_BUCKET          - e.g. my-app-static-assets
#   CLOUDFRONT_DIST_ID - e.g. E1234ABCDEF
#
# Optional:
#   AWS_REGION         - defaults to us-east-1

set -euo pipefail

: "${S3_BUCKET:?S3_BUCKET env var is required}"
: "${CLOUDFRONT_DIST_ID:?CLOUDFRONT_DIST_ID env var is required}"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo "Uploading static assets to s3://${S3_BUCKET}..."

# Next.js static chunks (long-lived cache - content-hashed filenames)
aws s3 sync .next/static "s3://${S3_BUCKET}/_next/static" \
  --region "${AWS_REGION}" \
  --cache-control "public,max-age=31536000,immutable" \
  --delete

# Public directory (shorter cache - filenames may not be hashed)
aws s3 sync public "s3://${S3_BUCKET}" \
  --region "${AWS_REGION}" \
  --cache-control "public,max-age=86400" \
  --delete \
  --exclude ".gitkeep"

echo "Invalidating CloudFront distribution ${CLOUDFRONT_DIST_ID}..."
aws cloudfront create-invalidation \
  --distribution-id "${CLOUDFRONT_DIST_ID}" \
  --paths "/*" \
  --region us-east-1   # CloudFront API always uses us-east-1

echo "Static assets deployed successfully."
