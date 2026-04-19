import { encodeTagForPath } from '../../lib/tags.js';

export interface ProxyPlayer {
  tag: string;
  name: string;
  clan?: {
    tag?: string;
    name?: string;
  };
  townHallLevel?: number;
  trophies?: number;
}

export class ProxyClient {
  constructor(
    private readonly options: {
      baseUrl: string;
      authToken: string;
      fetchImpl?: typeof fetch;
    }
  ) {}

  async getPlayer(playerTag: string): Promise<ProxyPlayer> {
    return this.requestJson<ProxyPlayer>(
      `/api/v1/coc/players/${encodeTagForPath(playerTag)}`,
      {
        method: 'GET',
      }
    );
  }

  private async requestJson<T>(path: string, init: RequestInit): Promise<T> {
    const fetchImpl = this.options.fetchImpl ?? fetch;
    const response = await fetchImpl(`${this.options.baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.options.authToken}`,
        ...(init.headers ?? {}),
      },
    });
    const body = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(
        describeError(body, `Proxy request failed with ${response.status}`)
      );
    }

    return body as T;
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

function describeError(body: unknown, fallback: string): string {
  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (
    typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    typeof body.message === 'string'
  ) {
    return body.message;
  }

  return fallback;
}
