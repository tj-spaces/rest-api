import isDevelopmentMode from "../lib/isDevelopment";

const rootURL = isDevelopmentMode()
  ? "http://localhost:3000"
  : "https://www.joinnebula.co";

export default (name: string) => `${rootURL}/auth/${name}/callback`;
