export interface ApiClientConfig {
  baseUrl: string;
  accessToken?: string;
}

export class ApiHttpClient {
  public constructor(private readonly config: ApiClientConfig) {}

  public async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.config.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(this.config.accessToken
          ? { Authorization: `Bearer ${this.config.accessToken}` }
          : {}),
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  }
}
