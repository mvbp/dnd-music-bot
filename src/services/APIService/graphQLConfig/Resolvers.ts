import { MusicService } from '../../MusicService/MusicService';
import { PubSub, withFilter } from 'apollo-server';

export class Resolvers {
  private musicService: MusicService;
  private pubSub: PubSub;
  private resolvers = {
    Query: {
      getQueue: (_, args) => {
        return this.musicService.getQueue(args.guildId);
      },
      getPlaylists: () => {
        return this.musicService.getPlaylists();
      },
    },
    Mutation: {
      joinChannel: (_, args) => {
        return this.musicService.joinChannel(
          args.channelId,
          args.playlistId,
          args.shuffle
        );
      },
      switchPlaylist: (_, args) => {
        const queue = this.musicService.getQueue(args.guildId);
        const playlist = this.musicService.getPlaylist(args.playlistId);
        return queue.switchPlaylist(playlist, args.shuffle).then(() => {
          return queue;
        });
      },
      skipSong: (_, args) => {
        const queue = this.musicService.getQueue(args.guildId);
        return queue.skipSong();
      },
      pauseSong: (_, args) => {
        const queue = this.musicService.getQueue(args.guildId);
        return queue.pauseSong();
      },
      resumeSong: (_, args) => {
        const queue = this.musicService.getQueue(args.guildId);
        return queue.resumeSong();
      },
      setVolume: (_, args) => {
        const queue = this.musicService.getQueue(args.guildId);
        return queue.setVolume(args.percent);
      },
      getPlayTime: (_, args) => {
        const queue = this.musicService.getQueue(args.guildId);
        return queue.getPlayTime();
      },
    },
    Subscription: {
      playlistChanged: {
        resolve: payload => {
          payload = payload.playlistChanged.queue;
          return payload;
        },
        subscribe: withFilter(
          (_, args) => this.pubSub.asyncIterator('playlistChanged'),
          (payload, args) => {
            return payload.playlistChanged.guildId === args.guildId;
          }
        ),
      },
      songChanged: {
        resolve: payload => {
          payload = payload.songChanged;
          return payload;
        },
        subscribe: withFilter(
          (_, args) => this.pubSub.asyncIterator('songChanged'),
          (payload, args) => {
            return payload.songChanged.guildId === args.guildId;
          }
        ),
      },
      volumeChanged: {
        resolve: payload => {
          payload = payload.volumeChanged.volume;
          return payload;
        },
        subscribe: withFilter(
          (_, args) => this.pubSub.asyncIterator('volumeChanged'),
          (payload, args) => {
            return payload.volumeChanged.guildId === args.guildId;
          }
        ),
      },
    },
  };

  constructor(musicService: MusicService, pubSub: PubSub) {
    this.musicService = musicService;
    this.pubSub = pubSub;
  }

  getResolvers(): any {
    return this.resolvers;
  }
}
