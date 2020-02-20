import { GraphQLServer, PubSub } from 'graphql-yoga';
import { TypeDefs } from './graphQLConfig/TypeDefs';
import { Resolvers } from './graphQLConfig/Resolvers';

export class APIService {
  private pubSub: PubSub;
  private typeDefs: string;
  private resolvers: any;
  constructor(pubSub: PubSub, resolvers: Resolvers, typeDefs: TypeDefs) {
    this.pubSub = pubSub;
    this.resolvers = resolvers.getResolvers();
    this.typeDefs = typeDefs.getTypeDefs();
  }

  serve(): GraphQLServer {
    const server = new GraphQLServer({
      typeDefs: this.typeDefs,
      resolvers: this.resolvers,
      context: {
        pubsub: this.pubSub,
      },
    });
    const options = {
      port: 3000,
    };
    server.start(options, () => {});

    return server;
  }
}
