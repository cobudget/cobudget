import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;

const jwtOptions = {
  // issuer:
  // audience:
  algorithm: 'HS256',
  expiresIn: '30d'
};

export const generateLoginJWT = user => {
  return new Promise((resolve, reject) => {
    return jwt.sign({ sub: user.id }, secretKey, jwtOptions, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

export const sendMagicLinkEmail = async (user, token) => {
  // send magic link, log in development
  console.log({
    url: `http://localhost:3000/login?token=${token}`,
    email: user.email
  });
  // dreams.wtf/login?token=${token}
};
