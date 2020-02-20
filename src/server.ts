import { PubSub } from 'graphql-yoga';
import { TypeDefs } from './services/APIService/graphQLConfig/TypeDefs';
import { Resolvers } from './services/APIService/graphQLConfig/Resolvers';
import { APIService } from './services/APIService/APIService';
import { MusicService } from './services/MusicService/MusicService';
import { Client } from 'discord.js';
import { PlaylistHelper } from './services/MusicService/PlaylistHelper';
import { DiscordService } from './services/DiscordService/DiscordService';

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
const resolvers = new Resolvers(musicService);

const apiService = new APIService(pubSub, resolvers, typeDefs);
apiService.serve();
