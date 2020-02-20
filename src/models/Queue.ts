import { IDiscordService } from '../services/DiscordService/IDiscordService';
import { Song } from './Song';
import { Playlist } from './Playlist';
import { PubSub } from 'graphql-yoga';
import { StreamDispatcher, VoiceConnection } from 'discord.js';

export class Queue {
  guildId: string;
  songs: Array<Song> = [];
  isPaused: Boolean = true;
  currentTrackNumber: number = 0;
  volume: number = 0.1;
  private voiceConnection: VoiceConnection;
  private discordAudioStream: StreamDispatcher | undefined;
  private pubSub: PubSub;
  private discordService: IDiscordService;
  private songEndListener = () => {
    this.skipSong();
  };
  constructor(
    voiceConnection: VoiceConnection,
    discordService: IDiscordService,
    playlist: Playlist,
    shuffle: Boolean,
    pubSub: PubSub
  ) {
    this.voiceConnection = voiceConnection;
    this.guildId = voiceConnection.channel.guild.id;
    this.discordService = discordService;
    this.pubSub = pubSub;
    this.switchPlaylist(playlist, shuffle);
  }

  async switchPlaylist(playlist: Playlist, shuffle: Boolean) {
    this.songs = playlist.songs;
    if (shuffle) {
      this.songs = this.shuffleSongs(this.songs);
    }
    this.currentTrackNumber = 0;
    this.discordAudioStream = await this.discordService.playSong(
      this.voiceConnection,
      this.getCurrentSong(),
      this.volume,
      this.songEndListener
    );
    this.notifySubscribersChanged('TRACK_NUMBER');
  }

  skipSong() {
    this.currentTrackNumber = this.getNextTrackNumber();

    this.discordService.playSong(
      this.voiceConnection,
      this.getCurrentSong(),
      this.volume,
      this.songEndListener
    );
  }

  pauseSong() {
    this.isPaused = true;
    if (this.isMusicPlaying()) {
      this.discordService.pauseSong(this.discordAudioStream!);
    }
  }

  resumeSong() {
    this.isPaused = false;
    if (this.isMusicPlaying()) {
      this.discordService.resumeSong(this.discordAudioStream!);
    }
  }

  setVolume(volumePercent: number) {
    this.volume = volumePercent;
    if (this.isMusicPlaying()) {
      return this.discordService.setVolume(
        this.discordAudioStream!,
        volumePercent
      );
    } else {
      return 0;
    }
  }

  getPlayTime(): number {
    if (this.isMusicPlaying()) {
      return this.discordService.getPlayTime(this.discordAudioStream!);
    } else {
      return 0;
    }
  }

  private isMusicPlaying() {
    return this.discordAudioStream != null;
  }

  private getCurrentSong() {
    return this.songs[this.currentTrackNumber];
  }

  private getNextTrackNumber() {
    return (this.currentTrackNumber + 1) % this.songs.length;
  }

  private shuffleSongs(songs: Array<Song>) {
    for (let i = songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    return songs;
  }

  notifySubscribersChanged(mutation: string) {
    this.pubSub?.publish(`queueUpdated-${this.guildId}`, {
      queueUpdated: {
        mutation: mutation,
        data: this,
      },
    });
  }
}
