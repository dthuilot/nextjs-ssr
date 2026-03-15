#!/usr/bin/env node

/**
 * Local Lambda simulation for testing SSR behavior.
 *
 * This script starts the Next.js standalone server exactly as it would run
 * inside a Lambda container, letting you verify SSR pages work in production
 * mode before deploying.
 *
 * Usage:
 *   npm run build          # build first
 *   npm run local:lambda   # then run this script
 *
 * The server starts on http://localhost:3001 by default.
 * Set PORT env var to change the port.
 */

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const standaloneServer = path.resolve(__dirname, '..', '.next', 'standalone', 'server.js')

if (!fs.existsSync(standaloneServer)) {
  console.error('ERROR: Standalone server not found at', standaloneServer)
  console.error('Run `npm run build` first to generate the standalone output.')
  process.exit(1)
}

const port = process.env.PORT || '3001'

console.log(`Starting Next.js standalone server on http://localhost:${port}`)
console.log('(simulating Lambda runtime - production mode, SSR active)\n')

const server = spawn(process.execPath, [standaloneServer], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: port,
    HOSTNAME: '0.0.0.0',
  },
  stdio: 'inherit',
})

server.on('error', (err) => {
  console.error('Failed to start server:', err.message)
  process.exit(1)
})

server.on('exit', (code) => {
  process.exit(code ?? 0)
})

process.on('SIGINT', () => server.kill('SIGINT'))
process.on('SIGTERM', () => server.kill('SIGTERM'))
