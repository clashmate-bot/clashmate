import assert from 'node:assert/strict';
import test from 'node:test';

import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

import { BaseSubcommand } from './base-subcommand.js';

class TestSubcommand extends BaseSubcommand {
  runCount = 0;

  constructor() {
    super({
      name: 'demo',
      description: 'Demo subcommand',
      category: 'util',
    });
  }

  protected override configure(builder: Parameters<BaseSubcommand['configure']>[0]) {
    return super.configure(builder).addStringOption((option) =>
      option.setName('value').setDescription('A value').setRequired(true)
    );
  }

  protected async run(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    void interaction;
    this.runCount += 1;
  }
}

test('BaseSubcommand registers its metadata on a parent slash command', () => {
  const builder = new SlashCommandBuilder()
    .setName('root')
    .setDescription('Root command');
  const subcommand = new TestSubcommand();

  subcommand.register(builder);

  const json = builder.toJSON();
  assert.equal(json.options?.[0]?.name, 'demo');
  assert.equal(json.options?.[0]?.description, 'Demo subcommand');
});

test('BaseSubcommand execute delegates to run()', async () => {
  const subcommand = new TestSubcommand();
  await subcommand.execute({} as ChatInputCommandInteraction);
  assert.equal(subcommand.runCount, 1);
});
