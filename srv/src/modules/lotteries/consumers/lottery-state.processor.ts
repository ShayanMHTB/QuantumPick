import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { LotteryStateManager } from '../services/lottery-state.manager';

@Processor('lottery-state')
export class LotteryStateProcessor {
  private readonly logger = new Logger(LotteryStateProcessor.name);

  constructor(private lotteryStateManager: LotteryStateManager) {}

  @Process('close-lottery')
  async handleCloseLottery(job: Job<{ lotteryId: string }>) {
    this.logger.log(
      `Processing close-lottery job for lottery ${job.data.lotteryId}`,
    );

    try {
      await this.lotteryStateManager.transitionToClosing(job.data.lotteryId);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to close lottery ${job.data.lotteryId}: ${error.message}`,
      );
      throw error;
    }
  }

  @Process('draw-lottery')
  async handleDrawLottery(job: Job<{ lotteryId: string }>) {
    this.logger.log(
      `Processing draw-lottery job for lottery ${job.data.lotteryId}`,
    );

    try {
      await this.lotteryStateManager.transitionToDrawing(job.data.lotteryId);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to draw lottery ${job.data.lotteryId}: ${error.message}`,
      );
      throw error;
    }
  }
}
