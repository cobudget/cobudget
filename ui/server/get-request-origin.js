export const getRequestOrigin = (req) =>
  `${req.headers["x-forwarded-proto"] === `https` ? `https` : `http`}://${
    req.headers.host
  }`;
