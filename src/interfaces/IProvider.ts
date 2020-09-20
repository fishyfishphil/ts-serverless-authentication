import { Profile } from "../profile";

interface SharedProviderOptions {
	scope?: string; 
	state?: string; 
	response_type?: string; 
	access_type?: string;
	prompt?: string;
}

export interface IProviderSignInOptions extends SharedProviderOptions {
	client_id: string;
	redirect_uri: string;
}

export interface IProviderOptions extends SharedProviderOptions {
	signin_uri?: string;
}

export interface IProviderCallbackEvent {
	provider?: string;
	stage?: string;
	host?: string;
	code: string;
	state: string;
}

export interface IProviderCallbackOptions {
	authorizationURL?: string;
	authorizationMethod?: string;
	profileURL?: string;
	tokenURL?: string;
	profileMap?: (response: any) => Profile;
}

export interface IProviderCallbackAdditionalParams {
	grant_type?: string;
	authorization?: object;
	profile?: Profile;
}

export interface IProvider {
	signin: (config: IProviderOptions) => { url: string }
	callback: (event: IProviderCallbackEvent, options: IProviderCallbackOptions, additionalParams: IProviderCallbackAdditionalParams) => any
}