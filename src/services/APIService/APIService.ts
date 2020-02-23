import { TypeDefs } from './graphQLConfig/TypeDefs';
import { Resolvers } from './graphQLConfig/Resolvers';
import { ApolloServer, gql } from 'apollo-server';
import config from 'config';

export class APIService {
  private typeDefs: string;
  private resolvers: any;
  constructor(resolvers: Resolvers, typeDefs: TypeDefs) {
    this.resolvers = resolvers.getResolvers();
    this.typeDefs = typeDefs.getTypeDefs();
  }

  serve(): ApolloServer {
    const typedefs = gql(this.typeDefs);
    const server = new ApolloServer({
      typeDefs: gql(this.typeDefs),
      resolvers: this.resolvers,
    });
    const port = config.get('server.port');

    server
      .listen({ port: parseInt(port) })
      .then(({ url, subscriptionsUrl }) => {
        console.log(`🚀 Server ready at ${url}`);
        console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
      });

    return server;
  }
}
