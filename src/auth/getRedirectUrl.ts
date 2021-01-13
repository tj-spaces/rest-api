import * as url from "../url";

const AUTH_URL_BASE = url.join(url.ROOT_URL, "auth");

export default (name: string) => url.join(AUTH_URL_BASE, name, "callback");
