import type {
  ClanLinkEntry,
  CreateLinkInput,
  HandoffLinkResult,
  ServiceClient,
  VerifyLinkResult,
} from '../integrations/service/client.js';
import type { ProxyClient, ProxyPlayer } from '../integrations/proxy/client.js';
import { normalizeTag } from '../lib/tags.js';

export interface OpenDashboardInput {
  userId: string;
  guildId: string;
  clanTag?: string;
}

export interface OpenDashboardResult {
  handoff: HandoffLinkResult;
  url: string;
}

export interface CreateLinkWorkflowInput {
  playerTag: string;
  userId: string;
  guildId: string;
  actorUserId: string;
}

export interface CreateLinkWorkflowResult {
  player: ProxyPlayer;
  link: {
    playerTag: string;
    playerName: string;
    userId: string;
    guildId: string;
    isVerified: boolean;
  };
}

export class LinkWorkflow {
  constructor(
    private readonly dependencies: {
      serviceClient: Pick<
        ServiceClient,
        'issueHandoffLink' | 'listClanLinks' | 'createLink' | 'deleteLink' | 'verifyLink'
      >;
      proxyClient: Pick<ProxyClient, 'getPlayer'>;
    }
  ) {}

  async openDashboard(
    input: OpenDashboardInput
  ): Promise<OpenDashboardResult> {
    const handoff = await this.dependencies.serviceClient.issueHandoffLink({
      userId: input.userId,
      guildId: input.guildId,
      path: '/links',
      metadata: input.clanTag
        ? {
            clanTag: normalizeTag(input.clanTag),
          }
        : undefined,
    });

    const url = new URL(handoff.url);

    if (input.clanTag) {
      url.searchParams.set('clanTag', normalizeTag(input.clanTag));
    }

    return {
      handoff,
      url: url.toString(),
    };
  }

  async listClanLinks(clanTag: string): Promise<ClanLinkEntry[]> {
    const result = await this.dependencies.serviceClient.listClanLinks(
      normalizeTag(clanTag)
    );

    return result.links;
  }

  async createLink(
    input: CreateLinkWorkflowInput
  ): Promise<CreateLinkWorkflowResult> {
    const playerTag = normalizeTag(input.playerTag);
    const player = await this.dependencies.proxyClient.getPlayer(playerTag);
    const payload: CreateLinkInput = {
      playerTag,
      playerName: player.name,
      userId: input.userId,
      guildId: input.guildId,
      linkedByUserId: input.actorUserId,
      source: 'bot',
    };
    const result = await this.dependencies.serviceClient.createLink(payload);

    return {
      player,
      link: result.link,
    };
  }

  async deleteLink(playerTag: string) {
    const result = await this.dependencies.serviceClient.deleteLink(
      normalizeTag(playerTag)
    );

    return result.link;
  }

  async verifyLink(
    playerTag: string,
    token: string,
    actorUserId: string
  ): Promise<VerifyLinkResult> {
    return this.dependencies.serviceClient.verifyLink({
      playerTag: normalizeTag(playerTag),
      token,
      actorUserId,
    });
  }
}
