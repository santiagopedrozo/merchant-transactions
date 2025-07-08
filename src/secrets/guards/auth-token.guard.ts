import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { SecretsService } from '../secrets.service';
import { Request } from 'express';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(@Inject(SecretsService) private secretsService: SecretsService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['auth_token'] as string | undefined;

    if (typeof token !== 'string') {
      throw new UnauthorizedException('Missing or invalid auth token header');
    }

    const authToken: string = this.secretsService.getSecret(
      'AUTH_TOKEN',
    ) as string;

    if (token !== authToken) {
      throw new UnauthorizedException('Invalid auth token');
    }

    return true;
  }
}
