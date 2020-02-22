import { Queue } from '../../models/Queue';
import { IPlaylistHelper } from './IPlaylistHelper';
import { Playlist } from '../../models/Playlist';
import { IDiscordService } from '../DiscordService/IDiscordService';
import { PubSub } from 'graphql-yoga';
import { VoiceConnection } from 'discord.js';

export class MusicService {
  private discordService: IDiscordService;
  private pubSub: PubSub;
  private botGuildMap: Map<string, Queue> = new Map();
  private playlistMap: Map<string, Playlist> = new Map();

  constructor(
    discordService: IDiscordService,
    playlistHelper: IPlaylistHelper,
    pubSub: PubSub
  ) {
    this.discordService = discordService;
    this.playlistMap = playlistHelper.getPlaylistMap();
    this.pubSub = pubSub;
  }

  async joinChannel(
    channelId: string,
    playlistId: string,
    shuffle: Boolean
  ): Promise<Queue> {
    const playlist = this.getPlaylist(playlistId)!;
    const voiceConnection = await this.getVoiceConnection(channelId);
    const guildId = voiceConnection.channel.guild.id;
    const newQueue = new Queue(
      voiceConnection,
      this.discordService,
      playlist,
      shuffle,
      this.pubSub
    );
    this.botGuildMap.set(guildId!, newQueue);
    return newQueue;
  }

  getQueue(guildId: string): Queue {
    const queue = this.botGuildMap.get(guildId);
    if (queue == null) {
      throw `No queue available for guild: ${guildId}`;
    }
    return queue;
  }

  getPlaylists(): Array<Playlist> {
    return Array.from(this.playlistMap.values());
  }

  getPlaylist(playlistId: string): Playlist {
    const playlist = this.playlistMap.get(playlistId);
    if (playlist == null) {
      throw `${playlistId} is not a valid playlist`;
    }
    return playlist;
  }

  private async getVoiceConnection(
    channelId: string
  ): Promise<VoiceConnection> {
    const voiceConnection = await this.discordService.connectVoiceConnectionFromChannelId(
      channelId
    );
    return voiceConnection;
  }
}
