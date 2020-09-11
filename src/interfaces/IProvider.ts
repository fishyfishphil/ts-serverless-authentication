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
	provider: string;
	stage: string;
	host: string;
	code: string;
	state: string;
}

export interface IProviderCallbackOptions {
	authorization_uri?: string;
	authorizationMethod?: string;
	profile_uri?: string;
	profileMap?: (response: any) => Profile;
}

export interface IProviderCallbackAdditionalParams {
	grant_type?: string;
	authorization?: object;
	profile?: Profile;
}