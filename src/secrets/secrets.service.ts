import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

export type Provider = 'GCP' | 'AWS' | 'LOCAL';
export type Environment = 'PROD' | 'STAGING' | 'DEV';
export type CacheType = 'REDIS' | 'LOCAL' | 'DB';

@Injectable()
export class SecretsService {
  private readonly _environment: Environment;
  private readonly providerEnv: Provider;
  private readonly logger = new Logger(SecretsService.name);

  constructor(private configService: ConfigService) {
    this._environment = this.configService.get<Environment>('ENV') || 'DEV';
    this.providerEnv = this.configService.get<Provider>('PROVIDER') || 'LOCAL';
  }

  get environment(): Environment {
    return this._environment;
  }

  getSecret(secret: string, environmentSpecific = false): any {
    const secretName = environmentSpecific
      ? `${this._environment.toLowerCase()}_${secret}`
      : secret;
    let result: any;
    switch (this.providerEnv) {
      case 'AWS':
        throw Error('AWS secrets not implemented');
        break;
      case 'LOCAL':
        result = this.configService.get<string>(secretName);
        break;
    }
    if (!result) {
      console.warn(`Env not set for ${secret}`);
    }
    return result;
  }

  generateApiKey(): string {
    return randomBytes(20).toString('hex');
  }
}
