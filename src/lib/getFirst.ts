export default function getFirst<T>(array: T[]): T | null {
  return array.length > 0 ? array[0] : null;
}
