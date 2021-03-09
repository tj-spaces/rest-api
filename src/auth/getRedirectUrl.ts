/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import isDevelopmentMode from "../lib/isDevelopment";

const rootURL = isDevelopmentMode()
  ? "http://localhost:3000"
  : "https://www.joinnebula.co";

export default (name: string) => `${rootURL}/auth/${name}/callback`;
