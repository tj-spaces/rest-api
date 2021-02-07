import InvalidArgumentError from "./InvalidArgumentError";

export function validateString(
  value: unknown,
  minLength: number,
  maxLength: number
): value is string {
  if (typeof value !== "string") return false;
  return value.length >= minLength && value.length <= maxLength;
}

export function assertString(
  value: unknown,
  minLength: number,
  maxLength: number
): asserts value is string {
  if (!validateString(value, minLength, maxLength)) {
    throw new InvalidArgumentError();
  }
}

export function validateNumber(
  value: unknown,
  minVal: number,
  maxVal: number
): value is number {
  if (typeof value !== "number") return false;
  return value >= minVal && value <= maxVal;
}

export function assertNumber(
  value: unknown,
  minVal: number,
  maxVal: number
): asserts value is number {
  if (!validateNumber(value, minVal, maxVal)) {
    throw new InvalidArgumentError();
  }
}

const stringIDRegex = /^\d+$/;
export function validateStringID(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return stringIDRegex.test(value);
}

export function assertStringID(value: unknown): asserts value is string {
  if (!validateStringID(value)) {
    throw new InvalidArgumentError();
  }
}
