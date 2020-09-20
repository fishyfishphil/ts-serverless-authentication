import { IProvider, IProviderCallbackAdditionalParams, IProviderCallbackEvent, IProviderCallbackOptions, IProviderOptions } from "../interfaces/IProvider";

export abstract class Provideable implements IProvider {
	abstract signin(config: IProviderOptions): { url: string };
	abstract callback(event: IProviderCallbackEvent, options: IProviderCallbackOptions, additionalParams: IProviderCallbackAdditionalParams): any
}