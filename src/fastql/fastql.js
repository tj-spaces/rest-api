class Schema {
  constructor({ resolvers, types }) {
    this.resolvers = resolvers;
    this.types = types;
  }
  resolve(current, type, projections) {
    if (type === "str" || type === "bool" || type === "id") {
      return current;
    }

    let resolver = resolvers[type] ?? {};
    let result = {};
    for (let [key, projectedValue] of Object.entries(projections)) {
      let val;
      if (key in resolver) {
        val = resolver(key, current);
      } else {
        val = current[key];
      }
      let ttype = types[type];
      if (ttype.startsWith("[]")) {
        result[key] = val.map((item) =>
          resolve(item, ttype.slice(2), projectedValue)
        );
      } else {
        result[key] = resolve(item, ttype, projectedValue);
      }
    }
  }
}

let mySchema = new Schema({
  resolvers: {
    //
  },
  types: {
    User: {
      id: "id",
      email: "str",
      verified_email: "bool",
      name: "bool",
      given_name: "str",
      family_name: "str",
      picture: "str",
      locale: "str",
      clusters: "[]Cluster",
    },
  },
});
