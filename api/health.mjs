// Simple health check that doesn't require DB
export default function handler(req, res) {
  res.statusCode = 200;
  res.end(JSON.stringify({ 
    status: 'ok', 
    time: new Date().toISOString(),
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
    }
  }));
}
