import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  
  // Only throw if the variable is strictly undefined
  if (val === undefined) {
    throw new Error(`Missing required env var: ${key}`);
  }
  
  return val;
}

export const env = {
  port:             parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv:          process.env.NODE_ENV ?? 'development',
  db: {
    host:     requireEnv('DB_HOST', 'localhost'),
    port:     parseInt(process.env.DB_PORT ?? '3306', 10),
    user:     requireEnv('DB_USER', 'root'),
    password: requireEnv('DB_PASSWORD', ''),
    name:     requireEnv('DB_NAME', 'ant_ecommerce'),
  },
  jwt: {
    secret:    requireEnv('JWT_SECRET', 'dev-secret-change-this'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY ?? '',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY ?? '',
  },
  clientUrl:      process.env.CLIENT_URL ?? 'http://localhost:5173',
  whatsappNumber: process.env.WHATSAPP_NUMBER ?? '',
} as const;

