import {IPolicyDocument} from './IPolicyDocument';

export interface IAuthResponse {
	principalId: string;
	policyDocument: IPolicyDocument; 
}