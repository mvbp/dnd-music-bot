import {
  Client,
  VoiceChannel,
  VoiceConnection,
  StreamDispatcher,
} from 'discord.js';
import { IDiscordService } from './IDiscordService';
import * as fs from 'fs';
import { Song } from '../../models/Song';
import * as config from 'config';
import * as ytdl from 'ytdl-core';

export class DiscordService implements IDiscordService {
  private apiToken = config.get('discord.apiToken');
  private client: Client;
  private loginStatus: Promise<string>;
  constructor(client: Client) {
    this.client = client;
    this.loginStatus = this.client.login(this.apiToken);
  }

  async leaveVoiceChannel(voiceConnection: VoiceConnection) {
    voiceConnection.channel.leave();
  }

  async connectVoiceConnectionFromChannelId(
    channelId: string
  ): Promise<VoiceConnection> {
    await this.loginStatus;
    const channel = await this.client.channels.fetch(channelId, false);
    if (channel?.type !== 'voice') {
      throw `Channel ${channelId} was not a voice channel`;
    }

    const voiceChannel = channel as VoiceChannel;
    return await this.joinVoiceChannel(voiceChannel);
  }
  private async joinVoiceChannel(
    voiceChannel: VoiceChannel
  ): Promise<VoiceConnection> {
    const voiceConnection = await voiceChannel.join();
    return voiceConnection;
  }

  async playSong(
    voiceConnection: VoiceConnection,
    song: Song,
    volume: number,
    songEndListener: () => void
  ): Promise<StreamDispatcher> {
    return new Promise((resolve, reject) => {
      const dispatcher = voiceConnection?.play(ytdl(song.url), {
        volume,
      });
      dispatcher?.on('finish', songEndListener);
      dispatcher?.on('start', () => {
        return resolve(dispatcher);
      });
    });
  }

  pauseSong(dispatcher: StreamDispatcher) {
    dispatcher.pause();
  }

  resumeSong(dispatcher: StreamDispatcher) {
    dispatcher.resume();
  }

  setVolume(dispatcher: StreamDispatcher, volumePercent: number) {
    dispatcher.setVolume(volumePercent / 100.0);
  }

  getPlayTime(dispatcher: StreamDispatcher): number {
    return dispatcher.totalStreamTime ? dispatcher?.totalStreamTime : 0;
  }
}
