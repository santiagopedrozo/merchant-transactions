import { Module } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { AuthTokenGuard } from './guards/auth-token.guard';

@Module({
  providers: [SecretsService, AuthTokenGuard],
  exports: [SecretsService],
})
export class SecretsModule {}
