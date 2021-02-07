import { RequestHandler } from "express";
import { User } from "../database/tables/users";
import InvalidArgumentError from "./InvalidArgumentError";

export type SafeAPISchema =
  | {
      type: "string";
    }
  | {
      type: "list";
      of: SafeAPISchema;
    }
  | {
      type: "object";
      properties: {
        [name: string]: SafeAPISchema;
      };
    }
  | {
      type: "number";
    };

export type SafeAPISchemaType<
  T extends SafeAPISchema
> = T["type"] extends "string"
  ? string
  : T["type"] extends "number"
  ? number
  : T["type"] extends "list"
  ? // @ts-expect-error
    SafeAPISchemaType<T["of"]>[]
  : T["type"] extends "object"
  ? {
      // @ts-expect-error
      [name in keyof T["properties"]]: SafeAPISchemaType<T["properties"][name]>;
    }
  : T["type"] extends "number"
  ? number
  : null;

export interface SafeAPIHandler<Output, Schema extends SafeAPISchema> {
  schema?: Schema;
  handler: (values: SafeAPISchemaType<Schema>) => Output;
}

export function validateSchema(
  schema: SafeAPISchema,
  test: unknown
): test is SafeAPISchemaType<typeof schema> {
  if (schema.type === "string") {
    return typeof test === "string";
  } else if (schema.type === "number") {
    return typeof test === "number";
  } else if (schema.type === "list") {
    return (
      Array.isArray(test) && test.every((val) => validateSchema(schema.of, val))
    );
  } else if (schema.type === "object") {
    if (typeof test !== "object") {
      return false;
    }
    for (let [key, val] of Object.entries(schema.properties)) {
      if (!validateSchema(val, test[key])) {
        return false;
      }
    }
    for (let key in test) {
      if (!(key in schema.properties)) {
        return false;
      }
    }
    return true;
  }
}

export function makeExpressHandler<O, S extends SafeAPISchema>(
  schema: S,
  handler: (values: SafeAPISchemaType<S>) => O
) {
  let expressHandler: RequestHandler = (req, res) => {
    let body = req.body;
    if (!validateSchema(schema, body)) {
      throw new InvalidArgumentError();
    }

    let result = handler(body);

    res.json({ status: "success", data: result });
  };

  return expressHandler;
}

export type TypedRequestHandler<T> = (req: Request) => T;
