/**
 * Profile class that normalizes profile data fetched from authentication provider
 */

function formatAddress(address: { formatted?: string, street_address?: string, postal_code: string, locality?: string, country?: string}) {
	const result = address;
	if (result) {
		result.formatted =
			`${result.street_address}\n${result.postal_code} ${result.locality}\n${result.country}`;
		return result;
	}
	return null;
}

export class Profile {
	_raw: any;
	[key: string]: any;
	/**
	 * @param data {object}
	 */
	
	constructor(data: any) {
		const fields = [
			'_raw',
			'address',
			'at_hash',
			'birthdate',
			'email_verified',
			'email',
			'family_name',
			'gender',
			'given_name',
			'id',
			'locale',
			'middle_name',
			'name',
			'nickname',
			'phone_number_verified',
			'phone_number',
			'picture',
			'preferred_username',
			'profile',
			'provider',
			'sub',
			'updated_at',
			'website',
			'zoneinfo'
		]
		this._raw = data;
		fields.forEach((field) => {
			if (Object.hasOwnProperty.call(data, field)) {
				const value = data[field];
				if (field === 'address') {
					this.address = formatAddress(data.address);
				} else {
					this[field] = value || null;
				}
			}
		})
	}
}