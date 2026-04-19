import assert from 'node:assert/strict';
import test from 'node:test';

import type { ChatInputCommandInteraction } from 'discord.js';

import { BaseCommand } from './base-command.js';

class TestCommand extends BaseCommand {
  runCount = 0;

  constructor() {
    super({
      name: 'test',
      description: 'Test command',
      category: 'util',
      guildOnly: true,
      defer: true,
      ephemeral: true,
    });
  }

  protected async run(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    void interaction;
    this.runCount += 1;
  }
}

test('BaseCommand blocks guild-only commands outside guilds', async () => {
  const command = new TestCommand();
  let replyPayload: unknown;

  const interaction = {
    inGuild() {
      return false;
    },
    guildId: null,
    async reply(payload: unknown) {
      replyPayload = payload;
    },
  } as unknown as ChatInputCommandInteraction;

  await command.execute(interaction);

  assert.deepEqual(replyPayload, {
    content: 'This command can only be used inside a Discord server.',
    ephemeral: true,
  });
  assert.equal(command.runCount, 0);
});

test('BaseCommand applies configured defer behavior before running', async () => {
  const command = new TestCommand();
  let deferPayload: unknown;

  const interaction = {
    deferred: false,
    replied: false,
    inGuild() {
      return true;
    },
    guildId: '111',
    async deferReply(payload: unknown) {
      deferPayload = payload;
    },
  } as unknown as ChatInputCommandInteraction;

  await command.execute(interaction);

  assert.deepEqual(deferPayload, {
    ephemeral: true,
  });
  assert.equal(command.runCount, 1);
});
