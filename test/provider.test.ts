/**
 * @jest-environment node
 */
const nock = require('nock')
const { Provider, Profile, config } = require('../src/index')
import { expect } from 'chai';
import 'mocha';

describe('Provider', () => {
	beforeEach(() => {
		process.env.PROVIDER_FACEBOOK_ID = 'fb-mock-id'
		process.env.PROVIDER_FACEBOOK_SECRET = 'fb-mock-secret'

		process.env.PROVIDER_CUSTOM_CONFIG_ID = 'cc-mock-id'
		process.env.PROVIDER_CUSTOM_CONFIG_SECRET = 'cc-mock-secret'

		process.env.REDIRECT_CLIENT_URI = 'http://localhost:3000/auth/{provider}/'
		process.env.REDIRECT_URI =
			'https://api-id.execute-api.eu-west-1.amazonaws.com/dev/authentication/callback/{provider}'
		process.env.TOKEN_SECRET = 'token-secret-123'
	})

	describe('Signin', () => {
		it('should return facebook signin url', () => {
			const provider = 'facebook'
			const providerConfig = config({ provider })
			const options = {
				signin_uri: `https://auth.laardee.com/signin/${provider}`,
				scope: 'profile email',
				state: 'state-123'
			}
			const data = new Provider(providerConfig).signin(options)
			expect(data.url).to.be.equal(
				'https://auth.laardee.com/signin/facebook?client_id=fb-mock-id&redirect_uri=https%3A%2F%2Fapi-id.execute-api.eu-west-1.amazonaws.com%2Fdev%2Fauthentication%2Fcallback%2Ffacebook&scope=profile%20email&state=state-123'
			)
		})

		it('should return custom signin url', () => {
			const provider = 'custom-config'
			const providerConfig = config({ provider })
			const options = {
				signin_uri: `https://auth.laardee.com/signin/${provider}`,
				scope: 'email',
				state: 'state-123'
			}
			const data = new Provider(providerConfig).signin(options)
			expect(data.url).to.be.equal(
				'https://auth.laardee.com/signin/custom-config?client_id=cc-mock-id&redirect_uri=https%3A%2F%2Fapi-id.execute-api.eu-west-1.amazonaws.com%2Fdev%2Fauthentication%2Fcallback%2Fcustom-config&scope=email&state=state-123'
			)
		})

		it('should fail to return signin url', () => {
			const provider = 'crappyauth'
			const providerConfig = config({ provider })
			const options = {
				authorizationURL: 'https://auth.laardee.com/signin/',
				scope: 'email',
				state: 'state-123'
			}

			let data
			try {
				data = new Provider(providerConfig).signin(options)
			} catch (exception) {
				expect(exception.message).to.be.equal(
					"Provider - signin()\nThese fields cannot be undefined: client_id, signin_uri"
				)
			}
			expect(data).to.be.undefined
		})
	})

	describe('Callback', () => {
		beforeEach(() => {
			nock('https://auth.laardee.com')
				.post('/auth')
				.reply(200, {
					access_token: 'access-token-123'
				})

			nock('https://api.laardee.com')
				.get('/me')
				.query({ access_token: 'access-token-123' })
				.reply(200, {
					id: '1',
					name: 'Eetu Tuomala',
					email: {
						primary: 'email@test.com'
					},
					profileImage:
						'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
				})
		})

		it('should return profile', async () => {
			const expectedProfile = {
				id: '1',
				name: 'Eetu Tuomala',
				email: 'email@test.com',
				picture: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460',
				provider: 'facebook',
				_raw: {
					id: '1',
					name: 'Eetu Tuomala',
					email: { primary: 'email@test.com' },
					profileImage:
						'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460',
					provider: 'facebook'
				}
			}

			const provider = 'facebook'
			const providerConfig = config({ provider })

			const profileMap = (response: any) =>
				new Profile(
					Object.assign(response, {
						email: response.email ? response.email.primary : null,
						picture: response.profileImage
					})
				)

			const options = {
				authorizationURL: 'https://auth.laardee.com/auth',
				profileURL: 'https://api.laardee.com/me',
				profileMap
			}

			const additionalParams = {
				grant_type: 'authorization_code'
			}

			const profile = await new Provider(providerConfig).callback(
				{
					code: 'abcde',
					state: 'state-123'
				},
				options,
				additionalParams
			)

			expect(profile.id).to.be.equal(expectedProfile.id)
			expect(profile.name).to.be.equal(expectedProfile.name)
			expect(profile.email).to.be.equal(expectedProfile.email)
			expect(profile.picture).to.be.equal(expectedProfile.picture)
			expect(profile.provider).to.be.equal(expectedProfile.provider)
			return expect(profile.at_hash).to.be.equal('access-token-123')
		})
	})
})
