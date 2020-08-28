import { Profile } from "../profile";

export interface IProviderOptions {
	signin_uri: string,
	scope?: string, 
	state?: string, 
	response_type?: string, 
	access_type?: string,
	prompt?: string
}

export interface IProviderCallbackEvent {
	provider: string,
	stage: string,
	host: string,
	code: string,
	state: string
}

export interface IProviderCallbackOptions {
	authorization_uri?: string,
	authorizationMethod?: string,
	profile_uri?: string,
	profileMap?: (response: object) => Profile
}

export interface IProviderCallbackAdditionalParams {
	grant_type?: string,
	authorization?: object,
	profile?: Profile
}