import { Profile } from "../profile";

export interface IProviderOptions {
	authorization_url?: string,
	signin_uri?: string,
	scope?: string,
	state?: string,
	profile_uri?: string
}

export interface IProviderCallback {
	code?: string,
	state?: string
}

export interface IProviderCallbackOptions {
	authorization_uri?: string,
	authorizationMethod?: string,
	profile_uri?: string,
	profileMap?: (response: any) => Profile
}

export interface IProviderCallbackAdditionalParams {
	grant_type?: string,
	authorization?: object,
	profile?: Profile
}