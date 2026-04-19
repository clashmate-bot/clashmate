import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';

import type { BotCommand } from './types.js';

export interface BaseCommandOptions {
  name: string;
  description: string;
  category: string;
  guildOnly?: boolean;
  defer?: boolean;
  ephemeral?: boolean;
}

export abstract class BaseCommand implements BotCommand {
  readonly name: string;
  readonly category: string;
  readonly guildOnly: boolean;
  readonly defer: boolean;
  readonly ephemeral: boolean;
  readonly data: SlashCommandBuilder;

  constructor(options: BaseCommandOptions) {
    this.name = options.name;
    this.category = options.category;
    this.guildOnly = options.guildOnly ?? false;
    this.defer = options.defer ?? false;
    this.ephemeral = options.ephemeral ?? false;
    this.data = new SlashCommandBuilder()
      .setName(options.name)
      .setDescription(options.description);
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (this.guildOnly && (!interaction.inGuild() || !interaction.guildId)) {
      await interaction.reply({
        content: 'This command can only be used inside a Discord server.',
        ephemeral: true,
      });
      return;
    }

    if (this.defer && !interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ ephemeral: this.ephemeral });
    }

    await this.run(interaction);
  }

  protected abstract run(
    interaction: ChatInputCommandInteraction
  ): Promise<void>;
}
