export interface IssueHandoffLinkInput {
  userId: string;
  guildId: string;
  path: '/links';
  metadata?: Record<string, unknown>;
}

export interface HandoffLinkResult {
  token: string;
  url: string;
  expiresAt: string;
  path: '/links' | '/clans' | '/rosters';
  scopes: string[];
}

export interface ClanLinkEntry {
  playerTag: string;
  playerName: string;
  userId: string | null;
  isLinked: boolean;
  isVerified: boolean;
  linkedAt: string | null;
}

export interface LinkRow {
  linkId: string;
  playerTag: string;
  playerName: string;
  userId: string;
  guildId: string;
  linkedByUserId: string;
  source: string;
  isVerified: boolean;
  linkOrder: number;
}

export interface CreateLinkInput {
  playerTag: string;
  playerName?: string;
  userId: string;
  guildId: string;
  linkedByUserId?: string;
  source?: string;
}

export interface VerifyLinkInput {
  playerTag: string;
  token: string;
  actorUserId?: string;
}

export interface VerifyLinkResult {
  verified: boolean;
  result: {
    status?: string;
  };
  link: LinkRow;
}

export class ServiceClient {
  constructor(
    private readonly options: {
      baseUrl: string;
      botToken: string;
      fetchImpl?: typeof fetch;
    }
  ) {}

  async issueHandoffLink(
    input: IssueHandoffLinkInput
  ): Promise<HandoffLinkResult> {
    return this.requestJson<HandoffLinkResult>('/api/v1/auth/handoff-links', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async listClanLinks(clanTag: string): Promise<{
    clanTag: string;
    links: ClanLinkEntry[];
  }> {
    return this.requestJson(`/api/v1/clans/${encodeURIComponent(clanTag)}/links`, {
      method: 'GET',
    });
  }

  async createLink(input: CreateLinkInput): Promise<{ link: LinkRow }> {
    return this.requestJson('/api/v1/links', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async deleteLink(playerTag: string): Promise<{ link: LinkRow }> {
    return this.requestJson(
      `/api/v1/links/${encodeURIComponent(playerTag)}`,
      {
        method: 'DELETE',
      }
    );
  }

  async verifyLink(input: VerifyLinkInput): Promise<VerifyLinkResult> {
    return this.requestJson('/api/v1/links/verify', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  private async requestJson<T>(path: string, init: RequestInit): Promise<T> {
    const fetchImpl = this.options.fetchImpl ?? fetch;
    const response = await fetchImpl(`${this.options.baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.options.botToken}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers ?? {}),
      },
    });
    const body = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(
        describeError(body, `Service request failed with ${response.status}`)
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
