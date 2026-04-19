import {
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';

import type { LinkWorkflow } from '../../modules/link-workflow.js';
import { BaseCommand } from '../base-command.js';

class VerifyCommand extends BaseCommand {
  constructor(private readonly workflow: LinkWorkflow) {
    super({
      name: 'verify',
      description: 'Verify a linked Clash account using the in-game API token',
      category: 'link',
      guildOnly: true,
      defer: true,
      ephemeral: true,
    });

    this.data
      .addStringOption((option) =>
        option
          .setName('player-tag')
          .setDescription('Player tag to verify')
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('token')
          .setDescription('Temporary in-game API token')
          .setRequired(true)
      );
  }

  protected async run(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const playerTag = interaction.options.getString('player-tag', true);
    const token = interaction.options.getString('token', true);
    const verification = await this.workflow.verifyLink(
      playerTag,
      token,
      interaction.user.id
    );
    const embed = new EmbedBuilder()
      .setTitle('Verification successful')
      .setDescription(
        `${verification.link.playerName} (${verification.link.playerTag}) is now verified.`
      )
      .addFields({
        name: 'Upstream status',
        value: verification.result.status ?? 'ok',
      });

    await interaction.editReply({ embeds: [embed] });
  }
}

export function createVerifyCommand(workflow: LinkWorkflow): VerifyCommand {
  return new VerifyCommand(workflow);
}
