import * as jwt from 'jsonwebtoken'
import { uncamel } from './uncamel'
import { IAuthResponse, IPolicyDocument, IStatement } from './interfaces';

/**
 * Utilities for Serverless Authentication
 */
export class Utils {
	/**
	 * Creates redirectUrl
	 * @param url {string} url base
	 * @param provider {string} provider e.g. facebook
	 */
	static redirectUrlBuilder(url: string, provider: string) {
		return url.replace(/{provider}/g, provider);
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
			if(value) result.push(`${uncamel(key)}=${value}`);
		}

		return result.join('&');
	}

	/**
	 * Creates Json Web Token with data
	 * @param data {object}
	 * @param config {object} with token_secret --> change to secret
	 */
	static createToken(data: object, secret: string, options?: object) {
		return jwt.sign(data, secret, options);
	}

	/**
	 * Reads Json Web Token and returns object
	 * @param token {string}
	 * @param config {object} with token_secret --> change to secret
	 */
	static readToken(token: string, secret: string, options?: object) {
		return jwt.verify(token, secret, options);
	}

	/**
	 * Creates token response and triggers callback
	 * @param data {payload: object, options: object}
	 * @param config {redirect_client_uri {string}, token_secret {string}}
	 */
	static tokenResponse(data: any, config: { redirect_client_uri: string, token_secret: string }) {
		const { payload, options } = data.authorizationToken;
		const params =
			Object.assign({}, data, {
				authorizationToken: this.createToken(payload, config.token_secret, options)
			})
		return { url: this.urlBuilder(config.redirect_client_uri, params) };
	}

	/**
	 * Creates error response and triggers callback
	 * @param params
	 * @param config {redirect_client_uri {string}}
	 */
	static errorResponse(params: object, config: { redirect_client_uri: string }) {
		return { url: this.urlBuilder(config.redirect_client_uri, params) };
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
}