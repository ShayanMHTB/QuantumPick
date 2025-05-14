import { ethers } from 'hardhat';

async function main() {
  const [deployer, ...users] = await ethers.getSigners();

  console.log('Deploying MockUSDC with the account:', deployer.address);
  console.log(
    'Account balance:',
    (await ethers.provider.getBalance(deployer.address)).toString(),
  );

  // Deploy the MockUSDC contract
  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();

  console.log('MockUSDC deployed to:', await usdc.getAddress());

  // Mint USDC to test accounts
  const mintAmount = ethers.parseUnits('10000', 6); // 10,000 USDC per account

  // Mint to all test accounts
  for (let i = 0; i < Math.min(users.length, 5); i++) {
    await usdc.transfer(users[i].address, mintAmount);
    const balance = await usdc.balanceOf(users[i].address);
    console.log(
      `Account ${users[i].address} USDC balance:`,
      ethers.formatUnits(balance, 6),
    );
  }

  // Save the USDC address to your .env file
  console.log('\nAdd this to your .env file:');
  console.log(`MOCK_USDC_ADDRESS=${await usdc.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
