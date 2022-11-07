export default function () {
    const magicLink = "http://localhost:3000/api/auth/magiclink/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWRpcmVjdCI6Ii8iLCJkZXN0aW5hdGlvbiI6ImFsaW5hdXJvemVAaG90bWFpbC5jb20iLCJyZW1lbWJlck1lIjp0cnVlLCJjb2RlIjoiMTgyMjkiLCJpYXQiOjE2Njc4NDk3MDIsImV4cCI6MTY2Nzg1MzMwMn0.UJaEr6piXLHp0sJDCvFwPkA5cB3Z4GYk8uXMzjZjIdk";
    cy.visit(magicLink);
}