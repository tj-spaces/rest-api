import * as url from "../url";

const AUTH_URL_BASE = url.join(url.ROOT_URL, "auth");
const errorUrl = url.join(AUTH_URL_BASE, "login-error");

export default () => errorUrl;
