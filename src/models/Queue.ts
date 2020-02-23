import { IDiscordService } from '../services/DiscordService/IDiscordService';
import { Song } from './Song';
import { Playlist } from './Playlist';
import { PubSub } from 'apollo-server';
import { StreamDispatcher, VoiceConnection } from 'discord.js';

export class Queue {
  guildId: string;
  songs: Array<Song> = [];
  isPaused: Boolean = true;
  trackNumber: number = 0;
  volumePercent: number = 0.1;
  private voiceConnection: VoiceConnection;
  private discordAudioStream: StreamDispatcher | undefined;
  private pubSub: PubSub;
  private discordService: IDiscordService;
  constructor(
    voiceConnection: VoiceConnection,
    discordService: IDiscordService,
    pubSub: PubSub
  ) {
    this.voiceConnection = voiceConnection;
    this.guildId = voiceConnection.channel.guild.id;
    this.discordService = discordService;
    this.pubSub = pubSub;
  }

  async switchPlaylist(playlist: Playlist, shuffle: Boolean) {
    this.songs = playlist.songs;
    if (shuffle) {
      this.songs = this.shuffleSongs(this.songs);
    }
    this.trackNumber = 0;
    await this.playSong();
    this.notifySubscribersPlaylistChanged();
  }
  private async playSong() {
    this.discordAudioStream = await this.discordService.playSong(
      this.voiceConnection,
      this.getCurrentSong(),
      this.volumePercent
    );
    this.setSongObservers();
    this.notifySubscribersSongChanged('New', this.songs[this.trackNumber], 0);
  }

  async skipSong(): Promise<Song> {
    this.trackNumber = this.getNextTrackNumber();
    await this.playSong();
    return this.getCurrentSong();
  }

  pauseSong() {
    this.isPaused = true;
    if (this.isMusicPlaying()) {
      this.discordService.pauseSong(this.discordAudioStream!);
    }
    this.notifySubscribersSongChanged(
      'Pause',
      this.songs[this.trackNumber],
      this.getPlayTime()
    );
    return this.getCurrentSong();
  }

  resumeSong() {
    this.isPaused = false;
    if (this.isMusicPlaying()) {
      this.discordService.resumeSong(this.discordAudioStream!);
    }
    this.notifySubscribersSongChanged(
      'Resume',
      this.songs[this.trackNumber],
      this.getPlayTime()
    );
    return this.getCurrentSong();
  }

  async setVolume(volumePercent: number): Promise<number> {
    this.volumePercent = volumePercent;
    if (this.isMusicPlaying()) {
      return await this.discordService.setVolume(
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
    return this.songs[this.trackNumber];
  }

  private getNextTrackNumber() {
    return (this.trackNumber + 1) % this.songs.length;
  }

  private shuffleSongs(songs: Array<Song>) {
    for (let i = songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    return songs;
  }

  setSongObservers() {
    this.discordAudioStream?.on('volumeChange', (_, newVolume: number) => {
      this.notifySubscribersVolumeChanged(newVolume);
    });

    this.discordAudioStream?.on('finish', () => {
      this.notifySubscribersSongChanged(
        'Finished',
        this.songs[this.trackNumber],
        this.getPlayTime()
      );
      this.skipSong();
    });
  }

  notifySubscribersSongChanged(mutation: string, song: Song, playTime: number) {
    this.pubSub?.publish('songChanged', {
      songChanged: {
        mutation,
        song,
        playTime,
        guildId: this.guildId,
      },
    });
  }

  notifySubscribersPlaylistChanged() {
    this.pubSub?.publish('playlistChanged', {
      playlistChanged: {
        queue: this,
        guildId: this.guildId,
      },
    });
  }

  notifySubscribersVolumeChanged(volume: number) {
    this.pubSub?.publish('volumeChanged', {
      volumeChanged: {
        volume,
        guildId: this.guildId,
      },
    });
  }
}
