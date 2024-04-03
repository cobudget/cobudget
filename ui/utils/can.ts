/**
 * Returns true if function runs successfully
 * and returns false if the function throws
 * error
 */

export default async function can(func, ...args) {
  try {
    await func(...args);
    return true;
  } catch (error) {
    return false;
  }
}
