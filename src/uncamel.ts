export function uncamel (text: string, seperator?: string) {
	let rgx = /(?:([a-z])([A-Z]))+/g;
	seperator ||= '_';
	return text.replace(rgx,`$1${seperator}$2`).toLowerCase();
}