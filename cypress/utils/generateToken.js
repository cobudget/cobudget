import jwt from "jsonwebtoken";

export default function generateToken(payload) {
  return jwt.sign(payload, Cypress.env("magicLinkSecret"));
}
