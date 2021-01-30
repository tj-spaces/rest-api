export type NestedPartial<T> = {
  [P in keyof T]?: NestedPartial<T[P]>;
};

export function deepMutateObject<T>(object: T, updates: NestedPartial<T>) {
  for (let [key, value] of Object.entries(updates)) {
    if (typeof object[key] === "object") {
      deepMutateObject(object[key], value);
    } else {
      object[key] = value;
    }
  }
  return object;
}
