/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
export const ROOT_URL = "http://localhost:5000/";

export function join(...urls: string[]) {
  if (!urls) return "";

  let [first, ...rest] = urls;

  // remove the trailing '/' if it appears
  let result = first.slice(0, first.length - +first.endsWith("/"));

  for (let url of rest) {
    // remove the preceeding '/' and trailing '/' if they appear
    url = url.slice(+url.startsWith("/"), url.length - +url.endsWith("/"));

    // join with a slash
    result += "/" + url;
  }

  return result;
}
