/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/

/**
 * Returns an array containing a string of the format `"A" = $1, "B" = $2, "C" = $3`, the list of the values
 * to supply ($1, $2, and $3), and the number to use for the next dollar-sign symbol (...$4, etc)
 * @param fields The fields to serialize into an updater string
 */
export default function createUpdateString(
  fields: Record<string, any>
): [string, any[], number] {
  let parts = [];
  let counter = 1;
  let values = [];
  for (let [field, value] of Object.entries(fields)) {
    parts.push(`"${field}" = $${counter}`);
    values.push(value);
    counter++;
  }
  return [parts.join(","), values, counter + 1];
}
