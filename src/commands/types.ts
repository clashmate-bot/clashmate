import type { ChatInputCommandInteraction } from 'discord.js';

export interface BotCommand {
  name: string;
  category: string;
  data: {
    toJSON(): unknown;
  };
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
