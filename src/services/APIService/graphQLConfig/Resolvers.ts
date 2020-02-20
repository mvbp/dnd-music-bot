import { MusicService } from '../../MusicService/MusicService';

export class Resolvers {
  private musicService: MusicService;
  private resolvers = {
    Query: {
      getQueue: (_, args, { pubsub }) => {
        return this.musicService.getQueue(args.guildId);
      },
      getPlaylists: () => {
        return this.musicService.getPlaylists();
      },
    },
    Mutation: {
      joinChannel: (_, args, { pubsub }) => {
        return this.musicService.joinChannel(
          args.channelId,
          args.playlistId,
          args.shuffle
        );
      },
      switchPlaylist: (_, args, { pubsub }) => {
        const queue = this.musicService.getQueue(args.guildId);
        const playlist = this.musicService.getPlaylist(args.playlistId);
        return queue.switchPlaylist(playlist, args.shuffle);
      },
      skipSong: (_, args, { pubsub }) => {
        const queue = this.musicService.getQueue(args.guildId);
        return queue.skipSong();
      },
      pauseSong: (_, args, { pubsub }) => {
        const queue = this.musicService.getQueue(args.guildId);
        return queue.pauseSong();
      },
      resumeSong: (_, args, { pubsub }) => {
        const queue = this.musicService.getQueue(args.guildId);
        return queue.resumeSong();
      },
      setVolume: (_, args, { pubsub }) => {
        const queue = this.musicService.getQueue(args.guildId);
        return queue.setVolume(args.percent);
      },
      getPlayTime: (_, args, { pubsub }) => {
        const queue = this.musicService.getQueue(args.guildId);
        return queue.getPlayTime();
      },
    },
    Subscription: {
      queueUpdated: {
        subscribe: (_, args, { pubsub }) => {
          return pubsub.asyncIterator(`queueUpdated-${args.guildId}`);
        },
      },
    },
  };

  constructor(musicService: MusicService) {
    this.musicService = musicService;
  }

  getResolvers(): any {
    return this.resolvers;
  }
}
