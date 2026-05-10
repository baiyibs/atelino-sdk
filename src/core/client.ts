import { SDKError, NetworkError } from './errors.js';
import { HttpClientConfig, RequestOptions } from '../types/http.js';

export class HttpClient {
	private baseURL: string;
	private timeout: number;
	private defaultHeaders: Record<string, string>;
	private token?: string;

	constructor(config: HttpClientConfig) {
		this.baseURL = config.baseURL.replace(/\/$/, '');
		this.timeout = config.timeout ?? 10000;
		this.defaultHeaders = {
			'Content-Type': 'application/json',
			...config.headers,
		};
		this.token = config.token;
	}

	setToken(token: string) {
		this.token = token;
	}

	private async request<T>(
		method: string,
		path: string,
		body?: any,
		options?: RequestOptions,
	): Promise<T> {
		const url = `${this.baseURL}${path}`;
		const headers = {
			...this.defaultHeaders,
			...(this.token && { Authorization: `Bearer ${this.token}` }),
			...options?.headers,
		};

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			const response = await fetch(url, {
				method,
				headers,
				body: body ? JSON.stringify(body) : undefined,
				signal: options?.signal ?? controller.signal,
			});

			clearTimeout(timeoutId);

			let data: any;
			const contentType = response.headers.get('content-type');
			if (contentType?.includes('application/json')) {
				data = await response.json();
			} else {
				data = await response.text();
			}

			if (!response.ok) {
				throw new SDKError(
					response.status,
					data?.code || 'HTTP_ERROR',
					data?.message || response.statusText,
				);
			}

			return data;
		} catch (err: any) {
			clearTimeout(timeoutId);
			if (err.name === 'AbortError') {
				throw new NetworkError(`Request timeout after ${this.timeout}ms`);
			}
			if (err instanceof SDKError) throw err;
			throw new NetworkError(err.message || 'Network request failed');
		}
	}

	get<T>(path: string, options?: RequestOptions) {
		return this.request<T>('GET', path, undefined, options);
	}

	post<T>(path: string, body?: any, options?: RequestOptions) {
		return this.request<T>('POST', path, body, options);
	}

	put<T>(path: string, body?: any, options?: RequestOptions) {
		return this.request<T>('PUT', path, body, options);
	}

	delete<T>(path: string, options?: RequestOptions) {
		return this.request<T>('DELETE', path, undefined, options);
	}
}
