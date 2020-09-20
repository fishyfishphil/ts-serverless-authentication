const crypto = require('crypto');
const { utils, config } = require('../src/index');
import { expect } from 'chai';
import 'mocha';

describe('Utils', () => {
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

	describe('Utils.redirectUrlBuilder', () => {
		it('should replace {provider} with facebook in url', () => {
			// Change to use config
			const testUrl = 'https://api.laardee.com/signin/{provider}'
			const builtUrl = utils.redirectUrlBuilder(testUrl, { provider: 'facebook' })
			expect(builtUrl).to.be.equal('https://api.laardee.com/signin/facebook')
		})
	})

	describe('Utils.urlBuilder', () => {
		it('should add ?foo=bar to https://api.laardee.com/callback/facebook', () => {
			// Change to use config
			const builtUrl = utils.urlBuilder(
				'https://api.laardee.com/callback/facebook',
				{ foo: 'bar' }
			)
			expect(builtUrl).to.be.equal(
				'https://api.laardee.com/callback/facebook?foo=bar'
			)
		});

		it('should be able to encode a value with a space', () => {
			const builtUrl = utils.urlBuilder(
				'https://api.laardee.com/callback/facebook',
				{ foo: 'profile email' }
			);
			expect(builtUrl).to.be.equal(
				'https://api.laardee.com/callback/facebook?foo=profile%20email'
			);
		});
	})

	describe('Utils.createToken', () => {
		it('should create new token', async () => {
			const providerConfig = config('facebook')
			const token = await utils.createToken(
				{ foo: 'bar' },
				providerConfig.token_secret,
				{ expiresIn: 1 }
			)
			expect(token).to.match(
				/[a-zA-Z0-9-_]+?.[a-zA-Z0-9-_]+?.([a-zA-Z0-9-_]+)[a-zA-Z0-9-_]+?$/g
			)
			expect(token.split('.')[0]).to.be.equal(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
			)
		})
	})

	describe('Utils.readToken', () => {
		it('should read token', async () => {
			const { token_secret } = config({ provider: 'facebook' })
			const token = await utils.createToken({ foo: 'bar' }, token_secret, {
				expiresIn: 60
			})
			const data = await utils.readToken(token, token_secret);
			expect(data.foo).to.be.equal('bar')
		})

		it('should fail to read expired token', async () => {
			const { token_secret } = config({ provider: 'facebook' })
			const token = await utils.createToken({ foo: 'bar' }, token_secret, {
				expiresIn: 0
			})
			try {
				await utils.readToken(token, token_secret)
			} catch (error) {
				expect(error.name).to.be.equal('TokenExpiredError')
				expect(error.message).to.be.equal('jwt expired')
			}
		})
	})

	describe('Utils.tokenResponse', async () => {
		it('should return token response', async () => {
			const providerConfig = config({ provider: 'facebook' })
			const authorizationToken = {
				payload: {
					id: 'bar'
				},
				options: {
					expiresIn: '60m'
				}
			}
			const tokenResponse = await utils.tokenResponse({ authorizationToken }, providerConfig);  
			expect(tokenResponse.url).to.match(
				/http:\/\/localhost:3000\/auth\/facebook\/(\D)*[a-zA-Z0-9-_]+?.[a-zA-Z0-9-_]+?.([a-zA-Z0-9-_]+)[a-zA-Z0-9-_]+?$/
			);	
		})
	})

	describe('Utils.UndefinedThrow', () => {
		it('Should throw an error when a value is not supplied', () => {
			let novalue;
			try {
				utils.throwUndefined({novalue});
			} catch (error) {
				expect(error.message).to.be.equal('These fields cannot be undefined: novalue');
			}
		});
	});

	describe('Utils.tokenResponse with refresh token', async () => {
		it('should return token response with refresh token', async () => {
			const providerConfig = config({ provider: 'facebook' })
			const id = 'bar'
			const time = new Date().getTime()
			const hmac = crypto.createHmac('sha256', providerConfig.token_secret)
			hmac.update(`${id}-${time}`)
			const refreshToken = hmac.digest('hex')
			const authorizationToken = {
				payload: {
					id
				},
				options: {
					expiresIn: '15m'
				}
			}
			const tokenResponse = await utils.tokenResponse({ authorizationToken, refreshToken, id }, providerConfig);
			expect(tokenResponse.url).to.match(
				/http:\/\/localhost:3000\/auth\/facebook\/\?authorization_token=[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?&refresh_token=[A-Fa-f0-9]{64}&id=.+$/
			)
		})
	})

	describe('Utils.errorResponse', () => {
		it('should return error response', () => {
			const providerConfig = config({ provider: 'crappy-provider' })
			const params = { error: 'Invalid provider' }
			expect(utils.errorResponse(params, providerConfig).url).to.be.equal(
				'http://localhost:3000/auth/crappy-provider/?error=Invalid%20provider'
			)
		})
	})

	describe('Utils.generatePolicy', () => {
		it('should generate policy', () => {
			const policy = utils.generatePolicy(
				'eetu',
				'Allow',
				'arn:aws:execute-api:eu-west-1:nnn:nnn/*/GET/'
			)
			expect(policy.principalId).to.be.equal('eetu')
		})
	})
})
