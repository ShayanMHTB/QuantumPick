import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

export interface WalletInfo {
  address: string;
  privateKey: string;
  role: string;
  index: number;
}

export interface WalletSetup {
  platform: {
    owner: WalletInfo;
    feeCollector: WalletInfo;
  };
  creators: WalletInfo[];
  participants: WalletInfo[];
}

export async function setupWallets(): Promise<WalletSetup> {
  const signers = await ethers.getSigners();

  const walletSetup: WalletSetup = {
    platform: {
      owner: {
        address: signers[0].address,
        privateKey:
          '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Well-known Hardhat key
        role: 'Platform Owner',
        index: 0,
      },
      feeCollector: {
        address: signers[1].address,
        privateKey:
          '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', // Well-known Hardhat key
        role: 'Platform Fee Collector',
        index: 1,
      },
    },
    creators: [],
    participants: [],
  };

  // Setup creator wallets (indices 2-6)
  for (let i = 2; i < 7; i++) {
    walletSetup.creators.push({
      address: signers[i].address,
      privateKey: getPrivateKeyForIndex(i),
      role: `Lottery Creator ${i - 1}`,
      index: i,
    });
  }

  // Setup participant wallets (indices 7-16)
  for (let i = 7; i < 17; i++) {
    walletSetup.participants.push({
      address: signers[i].address,
      privateKey: getPrivateKeyForIndex(i),
      role: `Participant ${i - 6}`,
      index: i,
    });
  }

  // Save wallet setup to file
  const outputDir = path.join(__dirname, '../generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'wallets.json'),
    JSON.stringify(walletSetup, null, 2),
  );

  console.log('Wallet setup complete. Details saved to generated/wallets.json');
  console.log('\nPlatform Owner:', walletSetup.platform.owner.address);
  console.log('Fee Collector:', walletSetup.platform.feeCollector.address);
  console.log(`Created ${walletSetup.creators.length} creator wallets`);
  console.log(`Created ${walletSetup.participants.length} participant wallets`);

  return walletSetup;
}

// Helper function to get deterministic private keys
function getPrivateKeyForIndex(index: number): string {
  // These are the well-known Hardhat private keys generated from the test mnemonic
  const hardhatPrivateKeys = [
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
    '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
    '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
    '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
    '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
    '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
    '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
    '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
    '0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897',
    '0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82',
    '0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1',
    '0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd',
    '0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa',
    '0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61',
    '0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0',
    '0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd',
    '0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0',
    '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e',
  ];

  return index < hardhatPrivateKeys.length ? hardhatPrivateKeys[index] : '';
}

// Run if called directly
if (require.main === module) {
  setupWallets()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
