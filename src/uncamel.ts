export function uncamel (text: string, seperator: string = '_') {
	return text.replace(/(?:([a-z])([A-Z]))+/g,`$1${seperator}$2`).toLowerCase();
}