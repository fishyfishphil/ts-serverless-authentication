import axios from 'axios';
import { Utils } from './utils';
import { IConfigValues,
	IProviderCallbackEvent,
	IProviderOptions,
	IProviderCallbackOptions,
	IProviderCallbackAdditionalParams,
	IProviderSignInOptions } from './interfaces';
import { utils } from '.';
import { Provideable } from './abstract/Providable';

/**
 * Default provider
 */
export class Provider extends Provideable {
	private config: IConfigValues;

	constructor(config: IConfigValues) {
		super();
		this.config = config;
	}

	public signin(config: IProviderOptions) {
		const client_id = this.config.id;
		const { redirect_uri, signin_uri } = { ...this.config, ...config };
		utils.throwUndefined({ client_id, redirect_uri, signin_uri }, 'Provider - signin()');

		let params: IProviderSignInOptions = {
			client_id: client_id || '',
			redirect_uri: redirect_uri || '',
			response_type: config.response_type || '',
			scope: config.scope || '',
			access_type: config.access_type || '',
			prompt: config.prompt || '',
			state: config.state || ''
		};

		const url = Utils.urlBuilder(signin_uri || '', params);
		return { url };
	};

	public async callback(
		event: IProviderCallbackEvent,
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
						code: event.code
					};
					const payload = {...mandatoryParams, ...authorization};
					if (options.authorizationMethod === 'GET') {
						const url = Utils.urlBuilder(options.authorizationURL || '', payload);
						try {
							console.log(url);
							const accessData = await axios.get(url);
							return accessData;
						} catch (error) {
							throw new Error(`attemptAuthorize error GET ${error}`);
						}
					}
					else {
						try {
							const accessData = await axios.post(options.authorizationURL || '', { form: payload });
							return accessData;
						} catch (error) {
							throw new Error(`attemptAuthorize error POST ${error}`);
						}
					}
				}

			const createMappedProfile = async (accessData: any) => {
					if (!accessData) {
						throw new Error('No access data');
					}

					const { access_token, refresh_token } = accessData?.data;
					const profileToken = { ...profile, ...{access_token} };
					const url = Utils.urlBuilder(
						options.profileURL || '',
						profileToken
					);

					try {
						const profileData = await axios.get(url);
						if (!profileData || !profileData.data) {
							throw new Error('No profile data was returned.');
						}
						const profileJson = { ...profileData.data, ...{ provider: provider, at_hash: access_token, offline_access: refresh_token || '' } };
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
			const state = event.state;
			return { ...{ state: state }, ...mappedProfile };
		}
}
