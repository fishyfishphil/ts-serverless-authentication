import * as jwt from 'jsonwebtoken'
import { uncamel } from './uncamel'
import { IAuthResponse, IConfigValues, IPolicyDocument, IStatement } from './interfaces';
import { IKeyIndex } from './interfaces/IKeyIndex';

/**
 * Utilities for Serverless Authentication
 */
export class Utils {
	/**
	 * Creates redirectUrl
	 * @param url {string} url base
	 * @param provider {string} provider e.g. facebook
	 */
	static redirectUrlBuilder(url: string, replacers: { provider: string, stage?: string }) {
		url = url.replace(/{provider}/g, replacers.provider);
		if(replacers.stage) {
			url = url.replace(/{stage}/g, replacers.stage);
		}
		return url;
	}

	/**
	 * Creates url with params
	 * @param url {string} url base
	 * @param params {object} url params
	 */
	static urlBuilder(url: string, params: object) {
		return `${url}?${this.urlParams(params)}`;
	}

	/**
	 * Creates &amp; separated params string
	 * @param params {object}
	 */
	static urlParams(params: object) {
		const result: string[] = [];
		for(const [key, value] of Object.entries(params)) {
			if(value) result.push(`${encodeURIComponent(uncamel(key))}=${encodeURIComponent(value)}`);
		}

		return result.join('&');
	}

	/**
	 * Creates Json Web Token with data
	 * @param data {object}
	 * @param config {object} with token_secret --> change to secret
	 */
	static async createToken(data: string | object | Buffer, secret: jwt.Secret, options?: jwt.SignOptions) {
			return new Promise((resolve, reject) => {
				const callback = (err: any, encoded?: string) => {
					if(err) return reject(err);
					else return resolve(encoded);
				};
				if(options) jwt.sign(data, secret, options, callback);
				else jwt.sign(data, secret, callback);
			});	
	}

	/**
	 * Reads Json Web Token and returns object
	 * @param token {string}
	 * @param config {object} with token_secret --> change to secret
	 */
	static async readToken(token: string, secret: string, options?: object) {
		return new Promise((resolve, reject) => {
			const callback = (err: any, decoded: any) => {
				if(err) return reject(err);
				else return resolve(decoded);
			};
			if(options) jwt.verify(token, secret, options, callback);
			else jwt.verify(token, secret, callback);
		});
	}

	/**
	 * Creates token response and triggers callback
	 * @param data {payload: object, options: object}
	 * @param config: {config: IConfigValues}
	 */
	static async tokenResponse(data: any, config: IConfigValues) {
		if(!config.redirect_client_uri || !config.token_secret) {
			throw new Error(`Undefined: recirect_client_uri ${config.redirect_client_uri} or token_secret ${config.token_secret}`);
		}
		const { payload, options } = data.authorizationToken;
		try {
			const authToken = await this.createToken(payload, config.token_secret, options);
			const params = { 
				...data, 
				...{ authorizationToken: authToken }
			};
			return { url: this.urlBuilder(config.redirect_client_uri, params) };
		} catch(error) {
			throw new Error(`tokenResponse error: ${error}`);
		}
	}

	/**
	 * 
	 * Creates error response and triggers callback
	 * @param params
	 * @param config {config: IConfigValues}
	 */
	static errorResponse(params: object, config: IConfigValues ) {
		if(!config.redirect_client_uri) {
			throw new Error('Missing redirect_client_uri');
		}
		return { url: this.urlBuilder(config.redirect_client_uri, params) };
	}

	/** 
	 * Simple way to check for undefined value and throw error for multiple fields.
	*/
	static throwUndefined = (properties: IKeyIndex, message?: string) : void => {
		const found = Object.entries(properties).filter(v => !v[1]).map(v => v[0]);
		const errorMessage = [message, `These fields cannot be undefined: ${found.join(', ')}`].filter(v => !!v);
		if(found.length !== 0) throw new Error(errorMessage.join('\n'));
	}
	
	/**
	 * Generates Policy for AWS Api Gateway custom authorize
	 * @param principalId {string} data for principalId field
	 * @param effect {string} 'Allow' or 'Deny'
	 * @param resource {string} method arn e.g. event.methodArn
	 *  (arn:aws:execute-api:<regionId>:<accountId>:<apiId>/<stage>/<method>/<resourcePath>)
	 */
	static generatePolicy(principalId: string, effect: string, resource: string) : IAuthResponse {
		if (!effect || !resource) throw 'Missing effect or resource'; 

		const statementOne: IStatement = {
			Action: 'execute-api:Invoke',
			Effect: effect,
			Resource: resource
		};

		const policyDocument: IPolicyDocument = {
			Version: '2012-10-17',
			Statement: [statementOne]  
		};

		const authResponse: IAuthResponse = {
			principalId: principalId,
			policyDocument: policyDocument
		};

		return authResponse;
	}

	static hasKeys(item: object): boolean {
		for(const key in item) {
			if(key) return true;
		}
		return false;
	}
}