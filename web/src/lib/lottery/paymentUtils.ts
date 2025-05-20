import { ethers } from 'ethers';
import lotteryService from '@/services/lottery/lotteryService';

export const processLotteryPayment = async (
  templateId: string,
  prizePool: number,
  chainId: number,
): Promise<{ paymentTxHash: string; paymentFromAddress: string }> => {
  // Get platform fee data
  const feeData = await lotteryService.getCreationFee(templateId, chainId);
  const creationFee = feeData.fee;
  const platformAddress = feeData.platformAddress;

  // Connect to MetaMask
  if (!window.ethereum) {
    throw new Error('Please install MetaMask to continue');
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const paymentFromAddress = await signer.getAddress();

  // Send payment transaction
  const tx = await signer.sendTransaction({
    to: platformAddress,
    value: creationFee,
  });

  // Wait for transaction to be mined
  const receipt = await tx.wait();

  if (!receipt || receipt.status !== 1) {
    throw new Error('Payment transaction failed');
  }

  return {
    paymentTxHash: receipt.hash,
    paymentFromAddress,
  };
};
