import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';

dotenv.config();

// Fixed mnemonic for deterministic wallet generation
const FIXED_MNEMONIC =
  process.env.HARDHAT_MNEMONIC ||
  'test test test test test test test test test test test junk';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: FIXED_MNEMONIC,
        count: 20, // 2 platform + 5 creators + 10 participants + spare
        accountsBalance: '100000000000000000000', // 100 ETH per account
      },
      chainId: 31337,
      mining: {
        auto: true,
        interval: 0, // Mine instantly on each transaction
      },
      hardfork: 'london',
      // Enable forking if you need mainnet state
      // forking: {
      //   url: process.env.MAINNET_RPC_URL || "",
      //   blockNumber: 19000000
      // }
    },
    // Additional test networks can be configured here
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 2100000,
      gasPrice: 8000000000,
    },
  },
  // Etherscan verification (optional)
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  // Gas reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
    gasPrice: 21,
  },
};

export default config;
