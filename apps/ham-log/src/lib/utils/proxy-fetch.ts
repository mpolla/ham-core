export async function fetch(input: string): Promise<Response> {
	return await globalThis.fetch(`/proxy?url=${btoa(input)}`);
}
