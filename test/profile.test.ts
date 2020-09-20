const _ = require('lodash')
const { Profile } = require('../src/index')
import { expect } from 'chai';
import 'mocha';

describe('Profile', () => {
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

	describe('create a new Profile', () => {
		it('should create a new profile from data', () => {
			const response = {
				address: {
					street_address: 'Urho Kekkosen Katu 7B',
					locality: 'Helsinki',
					region: 'Uusimaa',
					postal_code: '00100',
					country: 'Finland'
				},
				birthdate: '1970-01-01',
				email_verified: false,
				email: 'email@test.com',
				family_name: 'Tuomala',
				gender: 'male',
				given_name: 'Eetu',
				id: '12345',
				locale: 'fi-FI',
				middle_name: 'Laardee',
				name: 'Eetu Tuomala',
				nickname: 'Laardee',
				phone_number_verified: false,
				phone_number: '+1 (11) 111 1111',
				picture: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460',
				preferred_username: 'Laardee',
				profile: 'https://fi.linkedin.com/in/eetutuomala',
				provider: 'facebook',
				sub: 'sub',
				updated_at: 1311280970,
				website: 'https://github.com/laardee',
				zoneinfo: 'Europe/Helsinki',
				extra: 'extra'
			}

			const data = _.assign({}, response, { _raw: response })
			const profile = new Profile(data)

			expect(profile.id).to.be.equal('12345')
			expect(profile.name).to.be.equal('Eetu Tuomala')
			expect(profile.email).to.be.equal('email@test.com')
			expect(profile.picture).to.be.equal(
				'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
			)
			expect(profile.provider).to.be.equal('facebook')
			expect(profile.address.formatted).to.be.equal(
				'Urho Kekkosen Katu 7B\n00100 Helsinki\nFinland'
			)
			expect(profile).not.to.haveOwnProperty('extra')
			expect(profile._raw).to.haveOwnProperty('extra') // eslint-disable-line no-underscore-dangle
		})
	})
})
