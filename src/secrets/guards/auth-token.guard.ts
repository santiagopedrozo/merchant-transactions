import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException, Inject,
} from '@nestjs/common';
import {SecretsService} from "../../secrets/secrets.service";

@Injectable()
export class AuthTokenGuard implements CanActivate {
    constructor(
        @Inject(SecretsService) private secretsService: SecretsService
    ) {
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers['auth_token'];

        const authToken: string = await this.secretsService.getSecret('AUTH_TOKEN')

        if (token !== authToken) {
            throw new UnauthorizedException('Invalid auth token');
        }

        return true;
    }
}
