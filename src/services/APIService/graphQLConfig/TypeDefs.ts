import fs from 'fs';

export class TypeDefs {
  private typeDefs: string = fs.readFileSync(
    './src/services/APIService/graphQLConfig/DataModel.graphql',
    'utf8'
  );

  getTypeDefs(): string {
    return this.typeDefs;
  }
}
