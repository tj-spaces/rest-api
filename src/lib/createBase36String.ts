export const base36chars = "abcdefghijklmnopqrstuvwxyz0123456789";

export default function createBase36String(length = 8) {
  let result = "";
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * 36);
    result += base36chars.charAt(index);
  }
  return result;
}
