export default function mapToObject<V>(map: Map<string | number, V>) {
  let obj: { [key: string]: V } = {};
  for (let [key, value] of Array.from(map.entries())) {
    obj[key] = value;
  }

  return obj;
}
