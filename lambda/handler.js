'use strict'

/**
 * AWS Lambda handler for Next.js SSR.
 *
 * This handler wraps the Next.js server using serverless-http, which converts
 * API Gateway (v1/v2) or ALB events into Node.js IncomingMessage/ServerResponse
 * objects that Next.js understands.
 *
 * Deployment notes:
 *  - Deploy the contents of .next/standalone/ to Lambda
 *  - Copy .next/static/ to S3 (served via CloudFront)
 *  - Copy public/ to S3 (served via CloudFront)
 *  - Set NEXT_PUBLIC_ASSET_PREFIX env var to your CloudFront URL
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const serverless = require('serverless-http')

const app = next({
  dev: false,
  // When running in Lambda, the working directory is /var/task
  dir: process.env.LAMBDA_TASK_ROOT || process.cwd(),
})

const handle = app.getRequestHandler()

// Initialise once per Lambda container lifetime (warm start reuse)
let serverlessHandler

async function init() {
  if (serverlessHandler) return serverlessHandler

  await app.prepare()

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url || '/', true)
    handle(req, res, parsedUrl)
  })

  serverlessHandler = serverless(server, {
    // Treat binary content types as binary to avoid corruption
    binary: ['image/*', 'font/*', 'application/octet-stream'],
  })

  return serverlessHandler
}

// Pre-warm during cold start
const handlerPromise = init()

exports.handler = async (event, context) => {
  // Prevent Lambda from waiting for the event loop to drain
  context.callbackWaitsForEmptyEventLoop = false

  const handler = await handlerPromise
  return handler(event, context)
}
