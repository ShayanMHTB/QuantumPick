import { ethers } from 'hardhat';

async function main() {
  const [deployer, ...users] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);

  // Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  console.log('MockUSDC deployed to:', await usdc.getAddress());

  // Deploy LotteryFactory
  const LotteryFactory = await ethers.getContractFactory('LotteryFactory');
  const factory = await LotteryFactory.deploy();
  await factory.waitForDeployment();
  console.log('LotteryFactory deployed to:', await factory.getAddress());

  // Distribute USDC to test accounts
  const mintAmount = ethers.parseUnits('10000', 6); // 10,000 USDC per account
  for (let i = 0; i < Math.min(users.length, 5); i++) {
    await usdc.transfer(users[i].address, mintAmount);
    console.log(`Account ${i + 1} (${users[i].address}) received 10,000 USDC`);
  }

  // Platform fee receiver (second account)
  const platformFeeReceiver = users[0].address;

  console.log('\nUpdate your .env file with these values:');
  console.log(`MOCK_USDC_ADDRESS=${await usdc.getAddress()}`);
  console.log(`LOTTERY_FACTORY_ADDRESS=${await factory.getAddress()}`);
  console.log(`PLATFORM_FEE_ADDRESS=${platformFeeReceiver}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
