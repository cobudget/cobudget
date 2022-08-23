export default function validateUsername(username: string): boolean {
  if (username?.length < 2 || username?.length > 20) {
    return false;
  }
  return /^[a-zA-Z0-9]+$/.test(username);
}
