import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('QuantumPick Lottery System', function () {
  // Fixture for deploying contracts
  async function deployLotteryFixture() {
    const [
      owner,
      feeCollector,
      creator1,
      creator2,
      participant1,
      participant2,
      participant3,
      ...otherAccounts
    ] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory('MockUSDC');
    const usdc = await MockUSDC.deploy();

    // Deploy MockVRFCoordinator
    const MockVRFCoordinator = await ethers.getContractFactory(
      'MockVRFCoordinator',
    );
    const vrfCoordinator = await MockVRFCoordinator.deploy();

    // Deploy LotteryFactory
    const LotteryFactory = await ethers.getContractFactory('LotteryFactory');
    const factory = await LotteryFactory.deploy();

    // Transfer USDC to test accounts
    const fundAmount = ethers.parseUnits('10000', 6); // 10,000 USDC
    await usdc.transfer(creator1.address, fundAmount);
    await usdc.transfer(creator2.address, fundAmount);
    await usdc.transfer(participant1.address, fundAmount);
    await usdc.transfer(participant2.address, fundAmount);
    await usdc.transfer(participant3.address, fundAmount);

    return {
      usdc,
      vrfCoordinator,
      factory,
      owner,
      feeCollector,
      creator1,
      creator2,
      participant1,
      participant2,
      participant3,
      otherAccounts,
    };
  }

  describe('LotteryFactory', function () {
    it('Should deploy a new lottery with correct parameters', async function () {
      const { factory, usdc, creator1 } = await loadFixture(
        deployLotteryFixture,
      );

      const currentTime = await time.latest();
      const lotteryParams = {
        tokenAddress: await usdc.getAddress(),
        ticketPrice: ethers.parseUnits('10', 6),
        maxTickets: 100,
        minTickets: 10,
        startTime: currentTime + 60,
        endTime: currentTime + 3600,
        drawTime: currentTime + 3700,
        prizePercentages: [5000, 3000, 2000], // 50%, 30%, 20%
      };

      const tx = await factory
        .connect(creator1)
        .createLottery(
          lotteryParams.tokenAddress,
          lotteryParams.ticketPrice,
          lotteryParams.maxTickets,
          lotteryParams.minTickets,
          lotteryParams.startTime,
          lotteryParams.endTime,
          lotteryParams.drawTime,
          lotteryParams.prizePercentages,
        );

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = factory.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
          return parsed?.name === 'LotteryCreated';
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      const parsed = factory.interface.parseLog({
        topics: event!.topics,
        data: event!.data,
      });
      const lotteryAddress = parsed?.args.lotteryAddress;
      expect(lotteryAddress).to.be.properAddress;
    });

    it('Should emit LotteryCreated event with correct creator', async function () {
      const { factory, usdc, creator1 } = await loadFixture(
        deployLotteryFixture,
      );

      const currentTime = await time.latest();

      await expect(
        factory.connect(creator1).createLottery(
          await usdc.getAddress(),
          ethers.parseUnits('10', 6),
          100,
          10,
          currentTime + 60,
          currentTime + 3600,
          currentTime + 3700,
          [10000], // 100% to winner
        ),
      )
        .to.emit(factory, 'LotteryCreated')
        .withArgs(creator1.address, anyValue);
    });
  });

  describe('StandardLottery', function () {
    // Fixture for creating a lottery
    async function createLotteryFixture() {
      const baseFixture = await deployLotteryFixture();
      const { factory, usdc, creator1 } = baseFixture;

      const currentTime = await time.latest();
      const lotteryParams = {
        tokenAddress: await usdc.getAddress(),
        ticketPrice: ethers.parseUnits('10', 6),
        maxTickets: 100,
        minTickets: 10,
        startTime: currentTime + 60,
        endTime: currentTime + 3600,
        drawTime: currentTime + 3700,
        prizePercentages: [5000, 3000, 2000],
      };

      const tx = await factory
        .connect(creator1)
        .createLottery(
          lotteryParams.tokenAddress,
          lotteryParams.ticketPrice,
          lotteryParams.maxTickets,
          lotteryParams.minTickets,
          lotteryParams.startTime,
          lotteryParams.endTime,
          lotteryParams.drawTime,
          lotteryParams.prizePercentages,
        );

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = factory.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
          return parsed?.name === 'LotteryCreated';
        } catch {
          return false;
        }
      });

      const parsed = factory.interface.parseLog({
        topics: event!.topics,
        data: event!.data,
      });
      const lotteryAddress = parsed?.args.lotteryAddress;
      const lottery = await ethers.getContractAt(
        'StandardLottery',
        lotteryAddress,
      );

      return {
        ...baseFixture,
        lottery,
        lotteryParams,
      };
    }

    describe('Ticket Purchases', function () {
      it('Should allow buying tickets after start time', async function () {
        const { lottery, usdc, participant1, lotteryParams } =
          await loadFixture(createLotteryFixture);

        // Move time to after start
        await time.increaseTo(lotteryParams.startTime + 1);

        const ticketQuantity = 5;
        const totalCost = lotteryParams.ticketPrice * BigInt(ticketQuantity);

        // Approve USDC spending
        await usdc
          .connect(participant1)
          .approve(await lottery.getAddress(), totalCost);

        // Buy tickets
        await expect(lottery.connect(participant1).buyTickets(ticketQuantity))
          .to.not.be.reverted;

        // Check lottery state
        const details = await lottery.getDetails();
        expect(details[7]).to.equal(ticketQuantity); // totalTickets
      });

      it('Should reject purchases before start time', async function () {
        const { lottery, usdc, participant1, lotteryParams } =
          await loadFixture(createLotteryFixture);

        const ticketQuantity = 1;
        const totalCost = lotteryParams.ticketPrice * BigInt(ticketQuantity);

        // Approve USDC spending
        await usdc
          .connect(participant1)
          .approve(await lottery.getAddress(), totalCost);

        // Try to buy tickets before start
        await expect(
          lottery.connect(participant1).buyTickets(ticketQuantity),
        ).to.be.revertedWith('Not started');
      });

      it('Should reject purchases after end time', async function () {
        const { lottery, usdc, participant1, lotteryParams } =
          await loadFixture(createLotteryFixture);

        // Move time to after end
        await time.increaseTo(lotteryParams.endTime + 1);

        const ticketQuantity = 1;
        const totalCost = lotteryParams.ticketPrice * BigInt(ticketQuantity);

        // Approve USDC spending
        await usdc
          .connect(participant1)
          .approve(await lottery.getAddress(), totalCost);

        // Try to buy tickets after end
        await expect(
          lottery.connect(participant1).buyTickets(ticketQuantity),
        ).to.be.revertedWith('Ended');
      });

      it('Should reject purchases exceeding max tickets', async function () {
        const { lottery, usdc, participant1, lotteryParams } =
          await loadFixture(createLotteryFixture);

        // Move time to after start
        await time.increaseTo(lotteryParams.startTime + 1);

        const ticketQuantity = lotteryParams.maxTickets + 1;
        const totalCost = lotteryParams.ticketPrice * BigInt(ticketQuantity);

        // Approve USDC spending
        await usdc
          .connect(participant1)
          .approve(await lottery.getAddress(), totalCost);

        // Try to buy too many tickets
        await expect(
          lottery.connect(participant1).buyTickets(ticketQuantity),
        ).to.be.revertedWith('Exceeds max');
      });

      it('Should transfer correct USDC amount from buyer', async function () {
        const { lottery, usdc, participant1, lotteryParams } =
          await loadFixture(createLotteryFixture);

        // Move time to after start
        await time.increaseTo(lotteryParams.startTime + 1);

        const ticketQuantity = 5;
        const totalCost = lotteryParams.ticketPrice * BigInt(ticketQuantity);

        const balanceBefore = await usdc.balanceOf(participant1.address);

        // Approve and buy
        await usdc
          .connect(participant1)
          .approve(await lottery.getAddress(), totalCost);
        await lottery.connect(participant1).buyTickets(ticketQuantity);

        const balanceAfter = await usdc.balanceOf(participant1.address);
        expect(balanceBefore - balanceAfter).to.equal(totalCost);
      });
    });

    describe('Lottery Drawing', function () {
      it('Should allow drawing after draw time', async function () {
        const { lottery, lotteryParams } = await loadFixture(
          createLotteryFixture,
        );

        // Move time to after draw time
        await time.increaseTo(lotteryParams.drawTime + 1);

        // Draw winners
        await expect(lottery.drawWinners()).to.not.be.reverted;

        // Check status changed
        const details = await lottery.getDetails();
        expect(details[8]).to.equal(1); // status = completed
      });

      it('Should reject drawing before draw time', async function () {
        const { lottery, lotteryParams } = await loadFixture(
          createLotteryFixture,
        );

        // Move time to before draw time
        await time.increaseTo(lotteryParams.drawTime - 10);

        // Try to draw winners
        await expect(lottery.drawWinners()).to.be.revertedWith('Too early');
      });

      it('Should reject drawing twice', async function () {
        const { lottery, lotteryParams } = await loadFixture(
          createLotteryFixture,
        );

        // Move time to after draw time
        await time.increaseTo(lotteryParams.drawTime + 1);

        // Draw winners once
        await lottery.drawWinners();

        // Try to draw again
        await expect(lottery.drawWinners()).to.be.revertedWith('Already drawn');
      });
    });

    describe('Lottery Status', function () {
      it('Should return correct lottery details', async function () {
        const { lottery, usdc, lotteryParams } = await loadFixture(
          createLotteryFixture,
        );

        const details = await lottery.getDetails();

        expect(details[0]).to.equal(await usdc.getAddress()); // token
        expect(details[1]).to.equal(lotteryParams.ticketPrice); // ticket price
        expect(details[2]).to.equal(lotteryParams.maxTickets); // max tickets
        expect(details[3]).to.equal(lotteryParams.minTickets); // min tickets
        expect(details[4]).to.equal(lotteryParams.startTime); // start time
        expect(details[5]).to.equal(lotteryParams.endTime); // end time
        expect(details[6]).to.equal(lotteryParams.drawTime); // draw time
        expect(details[7]).to.equal(0); // total tickets (none sold yet)
        expect(details[8]).to.equal(0); // status (active)
      });
    });
  });

  describe('Integration Tests', function () {
    it('Should handle full lottery lifecycle', async function () {
      const {
        factory,
        usdc,
        creator1,
        participant1,
        participant2,
        participant3,
      } = await loadFixture(deployLotteryFixture);

      // 1. Create lottery
      const currentTime = await time.latest();
      const lotteryParams = {
        tokenAddress: await usdc.getAddress(),
        ticketPrice: ethers.parseUnits('10', 6),
        maxTickets: 50,
        minTickets: 5,
        startTime: currentTime + 60,
        endTime: currentTime + 3600,
        drawTime: currentTime + 3700,
        prizePercentages: [6000, 3000, 1000], // 60%, 30%, 10%
      };

      const createTx = await factory
        .connect(creator1)
        .createLottery(
          lotteryParams.tokenAddress,
          lotteryParams.ticketPrice,
          lotteryParams.maxTickets,
          lotteryParams.minTickets,
          lotteryParams.startTime,
          lotteryParams.endTime,
          lotteryParams.drawTime,
          lotteryParams.prizePercentages,
        );

      const receipt = await createTx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = factory.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
          return parsed?.name === 'LotteryCreated';
        } catch {
          return false;
        }
      });

      const parsed = factory.interface.parseLog({
        topics: event!.topics,
        data: event!.data,
      });
      const lotteryAddress = parsed?.args.lotteryAddress;
      const lottery = await ethers.getContractAt(
        'StandardLottery',
        lotteryAddress,
      );

      // 2. Move to start time
      await time.increaseTo(lotteryParams.startTime + 1);

      // 3. Participants buy tickets
      const buyTickets = async (participant: any, quantity: number) => {
        const cost = lotteryParams.ticketPrice * BigInt(quantity);
        await usdc.connect(participant).approve(lotteryAddress, cost);
        await lottery.connect(participant).buyTickets(quantity);
      };

      await buyTickets(participant1, 10);
      await buyTickets(participant2, 8);
      await buyTickets(participant3, 5);

      // 4. Check lottery state
      let details = await lottery.getDetails();
      expect(details[7]).to.equal(23); // total tickets sold

      // 5. Move to draw time
      await time.increaseTo(lotteryParams.drawTime + 1);

      // 6. Draw winners
      await lottery.drawWinners();

      // 7. Check final state
      details = await lottery.getDetails();
      expect(details[8]).to.equal(1); // status = completed

      // 8. Verify prize pool
      const lotteryBalance = await usdc.balanceOf(lotteryAddress);
      const expectedBalance = lotteryParams.ticketPrice * BigInt(23);
      expect(lotteryBalance).to.equal(expectedBalance);
    });

    it('Should handle lottery cancellation when minimum not met', async function () {
      const { factory, usdc, creator1, participant1 } = await loadFixture(
        deployLotteryFixture,
      );

      // Create lottery with high minimum
      const currentTime = await time.latest();
      const lotteryParams = {
        tokenAddress: await usdc.getAddress(),
        ticketPrice: ethers.parseUnits('10', 6),
        maxTickets: 100,
        minTickets: 50, // High minimum
        startTime: currentTime + 60,
        endTime: currentTime + 3600,
        drawTime: currentTime + 3700,
        prizePercentages: [10000],
      };

      const createTx = await factory
        .connect(creator1)
        .createLottery(
          lotteryParams.tokenAddress,
          lotteryParams.ticketPrice,
          lotteryParams.maxTickets,
          lotteryParams.minTickets,
          lotteryParams.startTime,
          lotteryParams.endTime,
          lotteryParams.drawTime,
          lotteryParams.prizePercentages,
        );

      const receipt = await createTx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = factory.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
          return parsed?.name === 'LotteryCreated';
        } catch {
          return false;
        }
      });

      const parsed = factory.interface.parseLog({
        topics: event!.topics,
        data: event!.data,
      });
      const lotteryAddress = parsed?.args.lotteryAddress;
      const lottery = await ethers.getContractAt(
        'StandardLottery',
        lotteryAddress,
      );

      // Buy only a few tickets
      await time.increaseTo(lotteryParams.startTime + 1);

      const cost = lotteryParams.ticketPrice * BigInt(5);
      await usdc.connect(participant1).approve(lotteryAddress, cost);
      await lottery.connect(participant1).buyTickets(5);

      // Move to after end time
      await time.increaseTo(lotteryParams.endTime + 1);

      // Check that minimum was not met
      const details = await lottery.getDetails();
      expect(details[7]).to.be.lessThan(lotteryParams.minTickets);

      // In a real implementation, there should be a refund mechanism here
      // This test demonstrates the scenario where refunds would be needed
    });
  });
});
