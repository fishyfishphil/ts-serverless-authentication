export interface IKeyIndex {
	[key: string]: boolean | number | string | object | IKeyIndex | undefined;
}