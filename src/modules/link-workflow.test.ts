import assert from 'node:assert/strict';
import test from 'node:test';

import { LinkWorkflow } from './link-workflow.js';

test('openDashboard appends the selected clan tag to the signed url', async () => {
  const workflow = new LinkWorkflow({
    serviceClient: {
      async issueHandoffLink() {
        return {
          token: 'signed-token',
          url: 'http://localhost:3000/links?t=signed-token',
          expiresAt: '2026-04-19T12:00:00.000Z',
          path: '/links',
          scopes: ['links:read', 'links:write'],
        };
      },
      async listClanLinks() {
        return { clanTag: '#2PP', links: [] };
      },
      async createLink() {
        throw new Error('not used');
      },
      async deleteLink() {
        throw new Error('not used');
      },
      async verifyLink() {
        throw new Error('not used');
      },
    },
    proxyClient: {
      async getPlayer() {
        throw new Error('not used');
      },
    },
  });

  const result = await workflow.openDashboard({
    userId: '222',
    guildId: '111',
    clanTag: '2pp',
  });

  assert.equal(
    result.url,
    'http://localhost:3000/links?t=signed-token&clanTag=%232PP'
  );
});

test('createLink loads live player data from the proxy before persisting', async () => {
  let receivedPlayerName = '';

  const workflow = new LinkWorkflow({
    serviceClient: {
      async issueHandoffLink() {
        throw new Error('not used');
      },
      async listClanLinks() {
        return { clanTag: '#2PP', links: [] };
      },
      async createLink(input) {
        receivedPlayerName = String(input.playerName ?? '');
        return {
          link: {
            linkId: '1',
            playerTag: input.playerTag,
            playerName: input.playerName ?? 'unknown',
            userId: input.userId,
            guildId: input.guildId,
            linkedByUserId: input.linkedByUserId ?? input.userId,
            source: input.source ?? 'bot',
            isVerified: false,
            linkOrder: 0,
          },
        };
      },
      async deleteLink() {
        throw new Error('not used');
      },
      async verifyLink() {
        throw new Error('not used');
      },
    },
    proxyClient: {
      async getPlayer(playerTag) {
        return {
          tag: playerTag,
          name: 'Electro Owl',
          clan: {
            tag: '#2PP',
            name: 'ClashMate Alpha',
          },
        };
      },
    },
  });

  const result = await workflow.createLink({
    playerTag: 'aaa111',
    userId: '444',
    guildId: '111',
    actorUserId: '222',
  });

  assert.equal(receivedPlayerName, 'Electro Owl');
  assert.equal(result.link.playerTag, '#AAA111');
  assert.equal(result.player.clan?.tag, '#2PP');
});

test('verifyLink forwards the normalized tag to the service', async () => {
  let verifiedTag = '';

  const workflow = new LinkWorkflow({
    serviceClient: {
      async issueHandoffLink() {
        throw new Error('not used');
      },
      async listClanLinks() {
        return { clanTag: '#2PP', links: [] };
      },
      async createLink() {
        throw new Error('not used');
      },
      async deleteLink() {
        throw new Error('not used');
      },
      async verifyLink(input) {
        verifiedTag = input.playerTag;
        return {
          verified: true,
          result: { status: 'ok' },
          link: {
            linkId: '1',
            playerTag: input.playerTag,
            playerName: 'Electro Owl',
            userId: '222',
            guildId: '111',
            linkedByUserId: input.actorUserId ?? '222',
            source: 'bot',
            isVerified: true,
            linkOrder: 0,
          },
        };
      },
    },
    proxyClient: {
      async getPlayer() {
        throw new Error('not used');
      },
    },
  });

  const result = await workflow.verifyLink('aaa111', '1234', '222');

  assert.equal(verifiedTag, '#AAA111');
  assert.equal(result.verified, true);
});
