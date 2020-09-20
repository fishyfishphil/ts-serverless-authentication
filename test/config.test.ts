const { config } = require('../src/index');
import { expect } from 'chai';
import 'mocha';


describe('Config', () => {
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

	describe('create a new Config', () => {
		it('tests facebook config', () => {
			const providerConfig = config({ provider: 'facebook' })
			expect(providerConfig.id).to.be.equal('fb-mock-id')
			expect(providerConfig.secret).to.be.equal('fb-mock-secret')
			expect(providerConfig.redirect_uri).to.be.equal(
				'https://api-id.execute-api.eu-west-1.amazonaws.com/dev/authentication/callback/facebook'
			)
			expect(providerConfig.redirect_client_uri).to.be.equal(
				'http://localhost:3000/auth/facebook/'
			)
		})

		it('tests facebook config with out REDIRECT_URI env variable', () => {
			delete process.env.REDIRECT_URI
			const providerConfig = config({
				provider: 'facebook',
				stage: 'prod',
				host: 'test-api-id.execute-api.eu-west-1.amazonaws.com'
			});
			expect(providerConfig.id).to.be.equal('fb-mock-id')
			expect(providerConfig.secret).to.be.equal('fb-mock-secret')
			expect(providerConfig.redirect_uri).to.be.equal(
				'https://test-api-id.execute-api.eu-west-1.amazonaws.com/prod/authentication/callback/facebook'
			)
			expect(providerConfig.redirect_client_uri).to.be.equal(
				'http://localhost:3000/auth/facebook/'
			)
		})

		it('tests custom-config', () => {
			process.env.REDIRECT_URI = 'https://api-id.execute-api.eu-west-1.amazonaws.com/dev/authentication/callback/{provider}'
			const providerConfig = config({ provider: 'custom-config' })
			expect(providerConfig.id).to.be.equal('cc-mock-id')
			expect(providerConfig.secret).to.be.equal('cc-mock-secret')
			expect(providerConfig.redirect_uri).to.be.equal(
				'https://api-id.execute-api.eu-west-1.amazonaws.com/dev/authentication/callback/custom-config'
			)
			expect(providerConfig.redirect_client_uri).to.be.equal(
				'http://localhost:3000/auth/custom-config/'
			)
		})

		it('tests custom_config', () => {
			const providerConfig = config({ provider: 'custom_config' })
			expect(providerConfig.id).to.be.equal('cc-mock-id')
			expect(providerConfig.secret).to.be.equal('cc-mock-secret')
			expect(providerConfig.redirect_uri).to.be.equal(
				'https://api-id.execute-api.eu-west-1.amazonaws.com/dev/authentication/callback/custom_config'
			)
			expect(providerConfig.redirect_client_uri).to.be.equal(
				'http://localhost:3000/auth/custom_config/'
			)
		})

		it('tests empty config', () => {
			const providerConfig = config({})
			expect(providerConfig.token_secret).to.be.equal('token-secret-123')
		})
	})
})
