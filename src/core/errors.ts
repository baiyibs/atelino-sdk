export class SDKError extends Error {
	constructor(
		public statusCode?: number,
		public code?: string,
		message?: string,
	) {
		super(message || `Request failed with status ${statusCode}`);
		this.name = 'SDKError';
	}
}

export class NetworkError extends SDKError {
	constructor(message: string) {
		super(undefined, 'NETWORK_ERROR', message);
		this.name = 'NetworkError';
	}
}

export class AuthenticationError extends SDKError {
	constructor(message = 'Authentication required') {
		super(401, 'AUTH_REQUIRED', message);
		this.name = 'AuthenticationError';
	}
}
