/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
import { db } from "../database";

export default function prepareStatement<T, P>(
  statement: string,
  parameterOrder: { [parameterName in keyof P]: number }
) {
  const parameterCount = Object.keys(parameterOrder).length;
  return (parameters: P) => {
    let parameterArray = Array(parameterCount);
    for (let [parameterName, parameterIndex] of Object.entries(
      parameterOrder
    )) {
      parameterArray[(parameterIndex as number) - 1] =
        parameters[parameterName];
    }
    return db.query<T>(statement, parameterArray);
  };
}
