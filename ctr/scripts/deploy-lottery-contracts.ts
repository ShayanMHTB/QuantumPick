// scripts/deploy-lottery-contracts.ts
import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

interface LotteryContracts {
  LotteryFactory: string;
  VRFCoordinator: string; // Mock VRF
  timestamp: string;
  network: string;
}

export async function deployLotteryContracts() {
  console.log('Deploying lottery contracts...');

  const [deployer] = await ethers.getSigners();

  // Deploy Mock VRF Coordinator first
  console.log('\n1. Deploying MockVRFCoordinator...');
  const MockVRFCoordinator = await ethers.getContractFactory(
    'MockVRFCoordinator',
  );
  const vrfCoordinator = await MockVRFCoordinator.deploy();
  await vrfCoordinator.waitForDeployment();
  const vrfAddress = await vrfCoordinator.getAddress();
  console.log('MockVRFCoordinator deployed to:', vrfAddress);

  // Deploy LotteryFactory
  console.log('\n2. Deploying LotteryFactory...');
  const LotteryFactory = await ethers.getContractFactory('LotteryFactory');
  const factory = await LotteryFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log('LotteryFactory deployed to:', factoryAddress);

  // Save deployed addresses
  const deployedContracts: LotteryContracts = {
    LotteryFactory: factoryAddress,
    VRFCoordinator: vrfAddress,
    timestamp: new Date().toISOString(),
    network: 'hardhat',
  };

  const outputDir = path.join(__dirname, './generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'lottery-contracts.json'),
    JSON.stringify(deployedContracts, null, 2),
  );

  console.log(
    '\nLottery contract deployment complete. Addresses saved to generated/lottery-contracts.json',
  );

  return deployedContracts;
}

// Run if called directly
if (require.main === module) {
  deployLotteryContracts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
