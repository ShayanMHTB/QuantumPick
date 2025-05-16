import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlockchainConfigService {
  constructor(private configService: ConfigService) {}

  getNetworks() {
    return this.configService.get('blockchain.networks');
  }

  getNetwork(name: string) {
    return this.configService.get(`blockchain.networks.${name}`);
  }

  getGasStrategy() {
    return this.configService.get('blockchain.gas');
  }

  getTransactionOptions() {
    return this.configService.get('blockchain.transaction');
  }

  getEventListenerOptions() {
    return this.configService.get('blockchain.eventListener');
  }

  getDeployerPrivateKey() {
    return this.configService.get('blockchain.deployerPrivateKey');
  }
}

// This is the factory function used by the config module
export default () => {
  // Get RPC URLs from environment variables with fallbacks
  const hardhatRpc =
    process.env.HARDHAT_NETWORK === 'localhost'
      ? 'http://localhost:8545'
      : 'http://hardhat:8545';

  const ethereumRpc = process.env.ETHEREUM_RPC_URL || '';
  const polygonRpc = process.env.POLYGON_RPC_URL || '';

  // Factory contract addresses by network
  const factoryAddresses = {
    // Hardhat local network
    1337: process.env.LOTTERY_FACTORY_ADDRESS_HARDHAT || '',

    // Mainnet
    1: process.env.LOTTERY_FACTORY_ADDRESS_MAINNET || '',

    // Polygon
    137: process.env.LOTTERY_FACTORY_ADDRESS_POLYGON || '',
  };

  // USDC token addresses by network
  const usdcAddresses = {
    1337: process.env.USDC_ADDRESS_HARDHAT || '',
    1:
      process.env.USDC_ADDRESS_MAINNET ||
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // Mainnet USDC
    137:
      process.env.USDC_ADDRESS_POLYGON ||
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon USDC
  };

  // Gas price strategy
  const gasStrategy = {
    // Percentage increase above base price for faster confirmation
    priorityMultiplier: parseFloat(
      process.env.GAS_PRIORITY_MULTIPLIER || '1.2',
    ),

    // Max gas price willing to pay (in gwei)
    maxGasPriceGwei: parseFloat(process.env.MAX_GAS_PRICE_GWEI || '100'),

    // Whether to use EIP-1559 fee market
    useEIP1559: process.env.USE_EIP1559 === 'true',
  };

  // Transaction options
  const txOptions = {
    // Number of confirmations to wait for
    confirmations: parseInt(process.env.TX_CONFIRMATIONS || '1'),

    // Number of retry attempts for failed transactions
    maxRetries: parseInt(process.env.TX_MAX_RETRIES || '3'),

    // Delay between retries in ms
    retryDelay: parseInt(process.env.TX_RETRY_DELAY || '5000'),
  };

  // Event listener options
  const eventListenerOptions = {
    // How often to poll for new events in ms
    pollingInterval: parseInt(process.env.EVENT_POLLING_INTERVAL || '15000'),

    // Max number of blocks to look back when checking for missed events
    maxBlocksLookback: parseInt(
      process.env.EVENT_MAX_BLOCKS_LOOKBACK || '1000',
    ),
  };

  return {
    networks: {
      hardhat: {
        chainId: 1337,
        rpcUrl: hardhatRpc,
        factoryAddress: factoryAddresses[1337],
        usdcAddress: usdcAddresses[1337],
        isTestnet: true,
      },
      mainnet: {
        chainId: 1,
        rpcUrl: ethereumRpc,
        factoryAddress: factoryAddresses[1],
        usdcAddress: usdcAddresses[1],
        isTestnet: false,
      },
      polygon: {
        chainId: 137,
        rpcUrl: polygonRpc,
        factoryAddress: factoryAddresses[137],
        usdcAddress: usdcAddresses[137],
        isTestnet: false,
      },
    },
    gas: gasStrategy,
    transaction: txOptions,
    eventListener: eventListenerOptions,

    // Deployment account (will be different per environment)
    deployerPrivateKey: process.env.LOTTERY_DEPLOYER_PRIVATE_KEY || '',
  };
};
