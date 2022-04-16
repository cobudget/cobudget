import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verify = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    return false;
  }
};

export const sign = (data: { [key: string]: string }) => {
  return jwt.sign(data, process.env.JWT_KEY);
};
