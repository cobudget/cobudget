import jwt from 'jsonwebtoken';

const jwtSecretKey = process.env.JWT_SECRET;

const jwtOptions = {
  // issuer:
  // audience:
  algorithm: 'HS256',
  expiresIn: '30d'
};

export const generateLoginJWT = user => {
  return new Promise((resolve, reject) => {
    return jwt.sign(
      { sub: user.id },
      jwtSecretKey,
      jwtOptions,
      (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      }
    );
  });
};
