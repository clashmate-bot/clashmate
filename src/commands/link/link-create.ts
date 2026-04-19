import {
  EmbedBuilder,
  type ChatInputCommandInteraction,
  type SlashCommandSubcommandBuilder,
} from 'discord.js';

import type { LinkWorkflow } from '../../modules/link-workflow.js';
import { BaseSubcommand } from '../base-subcommand.js';

export class LinkCreateSubcommand extends BaseSubcommand {
  constructor(private readonly workflow: LinkWorkflow) {
    super({
      name: 'create',
      description: 'Link a live CoC player to a Discord user',
      category: 'link',
    });
  }

  protected override configure(
    builder: SlashCommandSubcommandBuilder
  ): SlashCommandSubcommandBuilder {
    return super
      .configure(builder)
      .addStringOption((option) =>
        option
          .setName('player-tag')
          .setDescription('Player tag to link')
          .setRequired(true)
      )
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('Discord user that should own the link')
          .setRequired(true)
      );
  }

  protected async run(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const playerTag = interaction.options.getString('player-tag', true);
    const user = interaction.options.getUser('user', true);
    const result = await this.workflow.createLink({
      playerTag,
      userId: user.id,
      guildId: interaction.guildId!,
      actorUserId: interaction.user.id,
    });
    const embed = new EmbedBuilder()
      .setTitle('Link created')
      .setDescription(
        `${result.player.name} (${result.player.tag}) is now linked to <@${user.id}>.`
      )
      .addFields(
        {
          name: 'Live clan',
          value: result.player.clan?.name
            ? `${result.player.clan.name} (${result.player.clan.tag ?? 'unknown'})`
            : 'No clan',
        },
        {
          name: 'Verification',
          value: result.link.isVerified ? 'verified' : 'pending',
        }
      );

    await interaction.editReply({ embeds: [embed] });
  }
}
