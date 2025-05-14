import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';
import { setupWallets } from './setup-wallets';

interface DeployedContracts {
  MockUSDC: string;
  MockDAI: string;
  MockUSDT: string;
  timestamp: string;
  network: string;
}

export async function deployStablecoins() {
  console.log('Deploying stablecoin contracts...');

  const [deployer] = await ethers.getSigners();
  const walletSetup = await setupWallets();

  // Deploy MockUSDC
  console.log('\n1. Deploying MockUSDC...');
  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log('MockUSDC deployed to:', usdcAddress);

  // Deploy MockDAI
  console.log('\n2. Deploying MockDAI...');
  const MockDAI = await ethers.getContractFactory('MockDAI');
  const dai = await MockDAI.deploy();
  await dai.waitForDeployment();
  const daiAddress = await dai.getAddress();
  console.log('MockDAI deployed to:', daiAddress);

  // Deploy MockUSDT
  console.log('\n3. Deploying MockUSDT...');
  const MockUSDT = await ethers.getContractFactory('MockUSDT');
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log('MockUSDT deployed to:', usdtAddress);

  // Fund all wallets with stablecoins
  console.log('\n4. Funding wallets with stablecoins...');
  const fundAmount = ethers.parseUnits('100000', 6); // 100,000 of each stablecoin

  const allWallets = [
    walletSetup.platform.owner,
    walletSetup.platform.feeCollector,
    ...walletSetup.creators,
    ...walletSetup.participants,
  ];

  for (const wallet of allWallets) {
    // Fund with USDC
    const usdcTx = await usdc.transfer(wallet.address, fundAmount);
    await usdcTx.wait();

    // Fund with DAI
    const daiTx = await dai.transfer(
      wallet.address,
      ethers.parseUnits('100000', 18),
    ); // DAI has 18 decimals
    await daiTx.wait();

    // Fund with USDT
    const usdtTx = await usdt.transfer(wallet.address, fundAmount);
    await usdtTx.wait();

    console.log(`Funded ${wallet.role} (${wallet.address})`);
  }

  // Save deployed addresses
  const deployedContracts: DeployedContracts = {
    MockUSDC: usdcAddress,
    MockDAI: daiAddress,
    MockUSDT: usdtAddress,
    timestamp: new Date().toISOString(),
    network: 'hardhat',
  };

  const outputDir = path.join(__dirname, '../generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'stablecoins.json'),
    JSON.stringify(deployedContracts, null, 2),
  );

  console.log(
    '\nStablecoin deployment complete. Addresses saved to generated/stablecoins.json',
  );

  return deployedContracts;
}

// Run if called directly
if (require.main === module) {
  deployStablecoins()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
