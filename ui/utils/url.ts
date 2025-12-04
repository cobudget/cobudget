export const extractEmail = (text: string) => {
  return text.match(/([a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
};
