export default function validatePhoneNumber(phoneNumber: string): boolean {
  if (phoneNumber?.length == 0 || phoneNumber?.length > 20) {
    return false;
  }
  return /^\+?[0-9]*$/.test(phoneNumber);
}
