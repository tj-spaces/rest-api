import { SpaceParticipant } from "../spaces/SpaceParticipant";

export type ObjectUpdater<T> = {
  [P in keyof T]?: ObjectUpdater<T[P]> | ((oldValue: T[P]) => T[P]);
};

// Specify updates for an object
export type SetUpdater<T> = {
  [P in keyof T]?: T[P] extends {} ? SetUpdater<T[P]> : T[P];
};

export type UnsetUpdater<T> = {
  [P in keyof T]?: T[P] extends {} ? UnsetUpdater<T[P]> : true;
};

export type PushUpdater<T> = {
  // If this key is an array, you can send an array of updates to push
  // If this key is not an array, but an object, you can send a nested PushUpdater
  [P in keyof T]?: T[P] extends []
    ? T[P]
    : T[P] extends {}
    ? PushUpdater<T[P]>
    : never;
};

export type Updater<T> = {
  $set?: SetUpdater<T>;
  $push?: PushUpdater<T>;
  $unset?: SetUpdater<T>;
};

export function makeSetUpdates<T>(object: T, updater: SetUpdater<T>): T {
  // @ts-ignore
  let newObject: T = {};
  for (let [key, updates] of Object.entries(updater)) {
    if (typeof updates === "object") {
      newObject[key] = makeSetUpdates(object, updates);
    } else {
      newObject[key] = updates;
    }
  }
  return newObject;
}

export function makePushUpdates<T>(object: T, updater: PushUpdater<T>): T {
  // @ts-ignore
  let newObject: T = {};
  for (let [key, updates] of Object.entries(updater)) {
    if (Array.isArray(object[key])) {
      newObject[key] = [...object[key], ...(updates as any[])];
    } else if (typeof object[key] === "object") {
      newObject[key] = makePushUpdates(object[key], updates);
    } else {
      newObject[key] = object[key];
    }
  }
  return newObject;
}

export function deepMutateObject<T>(object: T, updates: Updater<T>) {
  if (updates.$set) {
    object = makeSetUpdates(object, updates.$set);
  }
  if (updates.$push) {
    object = makePushUpdates(object, updates.$push);
  }

  return object;
}
