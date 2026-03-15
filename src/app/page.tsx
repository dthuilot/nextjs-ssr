// This page is Server-Side Rendered (SSR).
// The timestamp is generated on the server at request time, proving SSR is working.

export const dynamic = 'force-dynamic'

async function getServerData() {
  const now = new Date()
  return {
    message: 'Hello, World!',
    renderedAt: now.toISOString(),
    environment: process.env.NODE_ENV,
    region: process.env.AWS_REGION || 'local',
  }
}

export default async function HomePage() {
  const data = await getServerData()

  return (
    <main>
      <h1>{data.message}</h1>
      <p>This page was <strong>server-side rendered</strong> at:</p>
      <code style={{ display: 'block', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
        {data.renderedAt}
      </code>
      <p style={{ marginTop: '1.5rem', color: '#666' }}>
        Environment: <strong>{data.environment}</strong> &mdash; Region: <strong>{data.region}</strong>
      </p>
      <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #ddd' }} />
      <p style={{ fontSize: '0.85rem', color: '#999' }}>
        Reload the page to see the timestamp update &mdash; confirming SSR is active (not static generation).
      </p>
    </main>
  )
}
