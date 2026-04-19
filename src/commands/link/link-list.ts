import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  type SlashCommandSubcommandBuilder,
} from 'discord.js';

import type { LinkWorkflow } from '../../modules/link-workflow.js';
import { BaseSubcommand } from '../base-subcommand.js';

export class LinkListSubcommand extends BaseSubcommand {
  constructor(private readonly workflow: LinkWorkflow) {
    super({
      name: 'list',
      description: 'List clan links or open the signed /links dashboard',
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
          .setName('clan-tag')
          .setDescription('Clan tag to inspect')
          .setRequired(true)
      )
      .addBooleanOption((option) =>
        option
          .setName('links')
          .setDescription('Open the signed browser dashboard instead of inline list')
          .setRequired(false)
      );
  }

  protected async run(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const clanTag = interaction.options.getString('clan-tag', true);
    const openDashboard = interaction.options.getBoolean('links') ?? false;

    if (openDashboard) {
      const result = await this.workflow.openDashboard({
        userId: interaction.user.id,
        guildId: interaction.guildId!,
        clanTag,
      });
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('Open /links dashboard')
          .setStyle(ButtonStyle.Link)
          .setURL(result.url)
      );

      await interaction.editReply({
        content:
          'Your signed ClashMate /links dashboard is ready. Do not share this link.',
        components: [row],
      });
      return;
    }

    const links = await this.workflow.listClanLinks(clanTag);
    const linkedCount = links.filter((entry) => entry.isLinked).length;
    const verifiedCount = links.filter((entry) => entry.isVerified).length;
    const preview = links
      .slice(0, 12)
      .map((entry) => {
        const status = entry.isLinked
          ? entry.isVerified
            ? 'linked · verified'
            : 'linked · pending'
          : 'unlinked';

        return `• ${entry.playerName} (${entry.playerTag}) — ${entry.userId ?? '—'} · ${status}`;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`ClashMate links · ${clanTag.toUpperCase()}`)
      .setDescription(preview || 'No cached members were found for this clan yet.')
      .addFields(
        {
          name: 'Linked',
          value: String(linkedCount),
          inline: true,
        },
        {
          name: 'Verified',
          value: String(verifiedCount),
          inline: true,
        },
        {
          name: 'Members in view',
          value: String(links.length),
          inline: true,
        }
      );

    await interaction.editReply({ embeds: [embed] });
  }
}
