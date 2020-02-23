import {
  Client,
  VoiceChannel,
  VoiceConnection,
  StreamDispatcher,
} from 'discord.js';
import { IDiscordService } from './IDiscordService';
import { Song } from '../../models/Song';
import config from 'config';
import youtubeStream from 'youtube-audio-stream';

export class DiscordService implements IDiscordService {
  private apiToken = config.get('discord.apiToken');
  private client: Client;
  private loginStatus: Promise<string>;
  private songChangeObservable;

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
    volume: number
  ): Promise<StreamDispatcher> {
    return new Promise((resolve, reject) => {
      const dispatcher = voiceConnection?.play(youtubeStream(song.url), {
        volume,
      });
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

  setVolume(
    dispatcher: StreamDispatcher,
    volumePercent: number
  ): Promise<number> {
    let volume = volumePercent;
    if (volumePercent > 1) {
      volume = 1;
    }
    if (Math.abs(volume - dispatcher.volume) < 0.005) {
      return Promise.resolve(volume);
    }
    dispatcher.setVolume(volume);
    return new Promise((resolve, _) => {
      dispatcher.volume;
      dispatcher?.on('volumeChange', (_, newVolume) => {
        return resolve(newVolume);
      });
    });
  }

  getPlayTime(dispatcher: StreamDispatcher): number {
    return dispatcher.totalStreamTime ? dispatcher?.totalStreamTime : 0;
  }
}
