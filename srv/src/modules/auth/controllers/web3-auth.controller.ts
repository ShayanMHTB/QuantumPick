import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SiweMessageDto } from '../dtos/siwe-message.dto';
import { SiweVerifyDto } from '../dtos/siwe-verify.dto';
import { Web3AuthService } from '../services/web3-auth.service';

@ApiTags('auth')
@Controller('auth/siwe')
export class Web3AuthController {
  constructor(private readonly web3AuthService: Web3AuthService) {}

  @Post('message')
  @ApiOperation({ summary: 'Get SIWE message for wallet authentication' })
  @ApiResponse({ status: 200, description: 'SIWE message created' })
  async createSiweMessage(@Body() siweMessageDto: SiweMessageDto) {
    const message = await this.web3AuthService.createSiweMessage(
      siweMessageDto.address,
      siweMessageDto.chainId,
    );

    return { message };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify SIWE signature' })
  @ApiResponse({ status: 200, description: 'Signature verified' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  verifySiwe(@Body() siweVerifyDto: SiweVerifyDto) {
    return this.web3AuthService.verifySiweMessage(
      siweVerifyDto.message,
      siweVerifyDto.signature,
    );
  }
}
