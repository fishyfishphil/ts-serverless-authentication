import { Utils } from './utils'
import { IConfig, IConfigValues, ILocalConfig } from './interfaces/IConfig';
import { LOCAL_CONFIGS, PROVIDER_CONFIGS } from './configs';

/**
 * Config class
 */
export class Config {
	private providers: IConfig;
	private localProvider: ILocalConfig;

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

	constructor() {
		if (Utils.hasKeys(PROVIDER_CONFIGS) && Utils.hasKeys(LOCAL_CONFIGS)) {
			this.providers = PROVIDER_CONFIGS;
			this.localProvider = LOCAL_CONFIGS;
		} else {
			this.providers = {};
			this.localProvider = {};
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
	}

	public getConfig(provider: string, redirect_uri?: string) {
		let result: IConfigValues = {};
		redirect_uri ||= this.localProvider.redirect_uri;
		if (provider) {
			const configProvider = provider.replace(/-/g, '_');
			const stage = this.providers[configProvider]?.stage;
			result = {
				...{ 
					redirect_uri:  Utils.redirectUrlBuilder(redirect_uri || '', {provider: provider, stage: stage || 'dev' }),
					redirect_client_uri: Utils.redirectUrlBuilder(this.localProvider.redirect_client_uri || '', {provider: provider}),
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
	let customUrl;
	if(options.host && options.stage) {
		customUrl = `https://${options.host}/${options.stage}/authentication/callback/{provider}`;
	}

	if (!process.env.REDIRECT_URI && customUrl !== undefined) {
		process.env.REDIRECT_URI = customUrl;
	}
	return (new Config()).getConfig(options.provider, customUrl);
}