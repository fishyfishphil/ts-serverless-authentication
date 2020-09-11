import { IConfig, ILocalConfig } from "../interfaces";

export const PROVIDER_CONFIGS: IConfig = {
	'facebook': {
		provider: 'facebook',
		id: 'fb-mock-id',
		secret: 'fb-mock-secret',
		stage: 'dev',
		host: 'api-id.execute-api.eu-west-1.amazonaws.com'
	},
	'google': {
		provider: 'google',
		id: 'gg-mock-id',
		secret: 'gg-mock-secret',
		stage: 'dev',
		host: 'api-id.execute-api.eu-west-1.amazonaws.com'
	},
	'linkedin': {
		provider: 'linkedin',
		id: 'li-mock-id',
		secret: 'li-mock-secret',
		stage: 'dev',
		host: 'api-id.execute-api.eu-west-1.amazonaws.com'
	},
	'amazon': {
		provider: 'amazon',
		id: 'az-mock-id',
		secret: 'az-mock-secret',
		stage: 'dev',
		host: 'api-id.execute-api.eu-west-1.amazonaws.com'
	},
	'twitch': {
		provider: 'twitch',
		id: 'th-mock-id',
		secret: 'th-mock-secret',
		stage: 'dev',
		host: 'api-id.execute-api.eu-west-1.amazonaws.com'
	},
	'twitter': {
		provider: 'twitter',
		id: 'tw-mock-id',
		secret: 'tw-mock-secret',
		stage: 'dev',
		host: 'api-id.execute-api.eu-west-1.amazonaws.com'
	},
	'slack': {
		provider: 'slack',
		id: 'sl-mock-id',
		secret: 'sl-mock-secret',
		stage: 'dev',
		host: 'api-id.execute-api.eu-west-1.amazonaws.com'
	},
	'tumblr': {
		provider: 'tumblr',
		id: 'tm-mock-id',
		secret: 'tm-mock-secret',
		stage: 'dev',
		host: 'api-id.execute-api.eu-west-1.amazonaws.com'
	},
	'dropbox': {
		provider: 'dropbox',
		id: 'db-mock-id',
		secret: 'db-mock-secret',
		stage: 'dev',
		host: 'api-id.execute-api.eu-west-1.amazonaws.com'		
	},
	'evernote': {
		provider: 'evernote',
		id: 'en-mock-id',
		secret: 'en-mock-secret',
		stage: 'dev',
		host: 'api-id.execute-api.eu-west-1.amazonaws.com'		
	},
	'pinterest': {
		provider: 'pinterest',
		id: 'pt-mock-id',
		secret: 'pt-mock-secret',
		stage: 'dev',
		host: 'api-id.execute-api.eu-west-1.amazonaws.com'		
	},
	'custom_config': {
		provider: 'custom_config',
		id: 'cc-mock-id',
		secret: 'cc-mock-secret',
		stage: 'dev',
		host: 'api-id.execute-api.eu-west-1.amazonaws.com'		
	}
};

export const LOCAL_CONFIGS: ILocalConfig = {
	redirect_client_uri: 'http://localhost:3000/auth/{provider}/',
	redirect_uri: 'https://api-id.execute-api.eu-west-1.amazonaws.com/{stage}/authentication/callback/{provider}',
	token_secret: 'token-secret-123'
};