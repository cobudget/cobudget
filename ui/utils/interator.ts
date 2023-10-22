export default function interator(count, fn) {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(fn(i));
  }
  return results;
}
