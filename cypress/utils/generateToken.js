import jwt from "jsonwebtoken";

export default function generateToken (payload) {
    //cy.log(process.env)
    //cy.log(process.env.MAGIC_LINK_SECRET || "EMP")
    return jwt.sign(payload, "83uj*U8j3r!@3");
}