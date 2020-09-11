export interface IConfigValues {
	id?: string;
	provider?: string;
	secret?: string;
	host?: string;
	stage?: string;
	token_secret?: string;
	redirect_uri?: string;
	redirect_client_uri?: string;
}

export interface IConfig {
	[key: string]: IConfigValues;
}

export interface ILocalConfig {
	token_secret?: string;
	redirect_uri?: string;
	redirect_client_uri?: string;
}