export interface HttpClientConfig {
	baseURL: string;
	timeout?: number;
	headers?: Record<string, string>;
	token?: string;
}

export interface RequestOptions {
	headers?: Record<string, string>;
	signal?: AbortSignal;
}
