export type Resolver = Function;

export interface ResolverSchemas {
  [schema: string]: {
    [property: string]: Resolver;
  };
}

export default function mergeResolverSchemas(
  resolverSchemas: ResolverSchemas[]
) {
  let resultResolverSchemas: ResolverSchemas = {};
  for (let resolverSchema of resolverSchemas) {
    for (let [schema, resolvers] of Object.entries(resolverSchema)) {
      if (!(schema in resultResolverSchemas)) {
        resultResolverSchemas[schema] = {};
      }

      for (let [property, resolver] of Object.entries(resolvers)) {
        resultResolverSchemas[schema][property] = resolver;
      }
    }
  }

  return resultResolverSchemas;
}
