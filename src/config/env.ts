const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'REDIS_HOST',
];

export function validateEnv(): void {
  const missing: string[] = [];

  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }

  // JWT_SECRET strength check
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters long');
  }

  console.log('✅ Environment variables validated');
}

