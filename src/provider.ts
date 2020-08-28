// import Promise from 'bluebird'
import axios from 'axios';
import { Utils } from './utils';
import { IProviderCallback, IProviderOptions, IProviderCallbackOptions, IProviderCallbackAdditionalParams } from './interfaces/IProvider';
import { IConfigValues } from './interfaces';
/**
 * Default provider
 */
export class Provider {
	private config: IConfigValues;

	constructor(config: IConfigValues) {
		this.config = config;
	}

	signin(config: IProviderOptions) {
		if (!this.config.id || !this.config.redirect_uri) {
			const message = `Invalid sign in params. client_id: '${this.config.id}' redirect_uri: '${this.config.redirect_uri}'`;
			throw new Error(message);
		}

		let params: { [key: string]: string } = {};
		params.client_id = this.config.id,
		params.redirect_uri = this.config.redirect_uri
		params.response_type = config.response_type || '';
		params.scope = config.scope || '';
		params.state = config.state || '';
		params.access_type = config.access_type || '';
		params.prompt = config.prompt || '';

		const url = Utils.urlBuilder(config.signin_uri, params);
		return { url };
	};

	async callback(
		config: IProviderCallback,
		options: IProviderCallbackOptions,
		additionalParams: IProviderCallbackAdditionalParams
	) {
			const { authorization, profile } = additionalParams
			const { id, redirect_uri, secret, provider } = this.config;

			const attemptAuthorize = async () => {
					const mandatoryParams = {
						client_id: id,
						redirect_uri: redirect_uri,
						client_secret: secret,
						code: config.code
					};
					const payload = {...mandatoryParams, ...authorization};
					if (options.authorizationMethod === 'GET') {
						const url = Utils.urlBuilder(options.authorization_uri || '', payload);
						try {
							const accessData = await axios.get(url);
							return accessData;
						} catch (error) {
							throw new Error(`attempAuthorize error GET ${error}`);
						}
					}
					else {
						try {
							const accessData = await axios.post(options.authorization_uri || '', { form: payload });
							return accessData;
						} catch (error) {
							throw new Error(`attempAuthorize error not GET ${error}`);
						}
					}
				}

			const createMappedProfile = async (accessData: any) => {
					if (!accessData) {
						throw new Error('No access data');
					}

					const { access_token, refresh_token } = accessData;
					const profileToken = { ...access_token, ...profile };
					const url = Utils.urlBuilder(
						options.profile_uri || '',
						profileToken
					);

					try {
						const profileData = await axios.get(url);
						if (!profileData) {
							throw new Error('No profile data was returned.');
						}
						const profileJson = { ...profileData, ...{ provider: provider, at_hash: access_token, offline_access: refresh_token || '' } };
						const mappedProfile = options?.profileMap
							? options.profileMap(profileJson)
							: profileJson
						return mappedProfile;
					} catch (error) {
						throw new Error(`createMappedProfile error ${error}`);
					}
				}
			
			const accessData = await attemptAuthorize();
			const mappedProfile = await createMappedProfile(accessData);
			const state = config.state;
			return { ...{ state }, ...mappedProfile };
		}
}
