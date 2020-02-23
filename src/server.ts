import { TypeDefs } from './services/APIService/graphQLConfig/TypeDefs';
import { Resolvers } from './services/APIService/graphQLConfig/Resolvers';
import { APIService } from './services/APIService/APIService';
import { MusicService } from './services/MusicService/MusicService';
import { Client } from 'discord.js';
import { PlaylistHelper } from './services/MusicService/PlaylistHelper';
import { DiscordService } from './services/DiscordService/DiscordService';
import { PubSub } from 'apollo-server';

const pubSub: PubSub = new PubSub();
const discordClient = new Client();
const discordServiceFactory = new DiscordService(discordClient);
const playlistHelper = new PlaylistHelper();
const musicService: MusicService = new MusicService(
  discordServiceFactory,
  playlistHelper,
  pubSub
);

const typeDefs = new TypeDefs();
const resolvers = new Resolvers(musicService, pubSub);

const apiService = new APIService(resolvers, typeDefs);
apiService.serve();
