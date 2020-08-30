import {IPolicyDocument} from './IPolicyDocument';
import { IKeyIndex } from './IKeyIndex';

export interface IAuthResponse {
	principalId?: string;
	policyDocument?: IPolicyDocument;
	context?: IKeyIndex;
}