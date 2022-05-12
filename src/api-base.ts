export interface Configuration {
  apiKey?: string;
  baseUrl: string;
}

export abstract class ApiBase {
  private _apiKey?: string;
  private _baseUrl: string;

  get baseUrl(): string {
    return this._baseUrl;
  }

  constructor(config: Configuration) {
    this._apiKey = config.apiKey;
    this._baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl : config.baseUrl + '/';
  }

  protected async request<T>(path: string, options?: RequestInit): Promise<T> {
    if (path.startsWith('/')) {
      path = path.slice(1);
    }

    if (path.endsWith('/')) {
      path = path.slice(0, path.length - 1);
    }

    let url = this._baseUrl + path;

    if (
      (!options?.method || options?.method === 'GET') &&
      options?.body &&
      options.body instanceof URLSearchParams
    ) {
      url = url + '?' + options.body;
      options.body = null;
    }

    const headers = new Headers({
      'Content-type': 'application/json',
    });

    if (this._apiKey) {
      headers.append('Authorization', this._apiKey);
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    const res = await fetch(url, requestOptions);
    if (res.ok) {
      return res.json();
    }
    throw new Error(res.statusText);
  }

  protected async get<T>(path: string, queryParams?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: 'GET',
      body: new URLSearchParams(queryParams),
    });
  }

  protected async post<T>(path: string, payload: BodyInit): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: payload,
    });
  }

  protected async put<T>(path: string, payload: BodyInit): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: payload,
    });
  }
}
