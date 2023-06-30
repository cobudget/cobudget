export const getOCToken = (round) => {
  return round?.ocToken || process.env.OPENCOLLECTIVE_API_KEY;
};
