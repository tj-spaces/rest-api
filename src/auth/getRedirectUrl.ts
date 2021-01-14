import * as url from "../url";

export default (name: string) =>
  url.join("http://localhost:3000/auth", name, "callback");
