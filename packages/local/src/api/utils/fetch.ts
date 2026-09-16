const platformFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => globalThis.fetch(input, init)

export default platformFetch
