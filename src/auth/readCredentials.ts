/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
export interface OAuthProviderClientCredentials {
  id: string;
  secret: string;
}

export default function readCredentials(
  name: string
): OAuthProviderClientCredentials {
  return {
    id: process.env[name.toUpperCase() + "_KEY_ID"],
    secret: process.env[name.toUpperCase() + "_SECRET"],
  };
}
