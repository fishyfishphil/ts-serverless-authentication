import { Utils } from './utils'
import { IConfig, IConfigValues, ILocalConfig } from './interfaces/IConfig';

/**
 * Config class
 */
export class Config {
  providers: IConfig = {};
  localProvider: ILocalConfig = {};

  private assignProvider(provider: string, type: string, value?: string) {
    switch(type) {
      case 'id':
        this.providers[provider].id = value;
        break;
      case 'secret':
        this.providers[provider].secret = value;
        break;
      case 'host':
        this.providers[provider].host = value;
        break;
      case 'stage':
        this.providers[provider].stage = value;
        break;
    }
  }

  private assignLocals(key: string, value?: string) {
    switch(key) {
      case 'REDIRECT_URI':
        this.localProvider.redirect_uri = value
        break;
      case 'REDIRECT_CLIENT_URI':
        this.localProvider.redirect_client_uri = value
        break;
      case 'TOKEN_SECRET':
        this.localProvider.token_secret = value
        break;
    }
  }

  constructor(provider_?: IConfig, localProvider_?: ILocalConfig) {
    const data = process.env;

    Object.keys(data).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        const providerItem = (/PROVIDER_(.*)?_(.*)?/g).exec(key);

        if (providerItem) {
          const provider = providerItem[1].toLowerCase();
          const type = providerItem[2].toLowerCase();
          this.providers[provider] ||= { provider: provider };
          this.assignProvider(provider, type, value);
        } else {
          this.assignLocals(key, value);
        }        
      }
    });
  }

  public getConfig(provider: string) {
    let result: IConfigValues = {};
    if (provider) {
      const configProvider = provider.replace(/-/g, '_');
      result = {
        ...{ 
          redirect_uri:  Utils.redirectUrlBuilder(this.localProvider.redirect_uri || '', provider),
          redirect_client_uri: Utils.redirectUrlBuilder(this.localProvider.redirect_client_uri || '', provider),
          provider: provider
        },
        ...this.providers[configProvider] 
      };
    }
    result.token_secret = this.localProvider.token_secret;
    return result;
  }
}

/**
 * @param provider {string} oauth provider name e.g. facebook or google
 */
export function config(options: { provider: string, host?: string, stage?: string }) {
  if (!process.env.REDIRECT_URI && options.host && options.stage) {
    process.env.REDIRECT_URI = `https://${options.host}/${options.stage}/authentication/callback/{provider}`;
  }
  return (new Config()).getConfig(options.provider);
}