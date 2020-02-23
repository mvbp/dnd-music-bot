import { VoiceChannel, VoiceConnection, StreamDispatcher } from 'discord.js';
import { Song } from '../../models/Song';

export interface IDiscordService {
  leaveVoiceChannel(voiceConnection: VoiceConnection): Promise<any>;

  connectVoiceConnectionFromChannelId(
    channelId: string
  ): Promise<VoiceConnection>;

  playSong(
    voiceChannel: VoiceConnection,
    song: Song,
    volume: number
  ): Promise<StreamDispatcher>;

  pauseSong(dispatcher: StreamDispatcher);

  resumeSong(dispatcher: StreamDispatcher);

  setVolume(
    dispatcher: StreamDispatcher,
    volumePercent: number
  ): Promise<number>;

  getPlayTime(dispatcher: StreamDispatcher): number;
}
