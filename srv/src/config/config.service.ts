import blockchainConfig from './services/blockchain-config.service';

export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret:
      process.env.JWT_SECRET || 'quantum-pick-development-secret-key-2025',
    expiresIn: process.env.JWT_EXPIRATION || '3600s',
  },
  siwe: {
    domain: process.env.SIWE_DOMAIN || 'quantumpick.io',
    origin: process.env.SIWE_ORIGIN || 'https://quantumpick.io',
    statement:
      process.env.SIWE_STATEMENT ||
      'Sign in to QuantumPick with your Ethereum account.',
    version: process.env.SIWE_VERSION || '1',
    chainId: parseInt(process.env.SIWE_CHAIN_ID || '1', 10),
  },
  blockchain: blockchainConfig(),
});
