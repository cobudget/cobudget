export default function () {
    const magicLink = "http://localhost:3000/api/auth/magiclink/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWRpcmVjdCI6Ii8iLCJkZXN0aW5hdGlvbiI6ImFsaW5hdXJvemVAaG90bWFpbC5jb20iLCJyZW1lbWJlck1lIjpmYWxzZSwiY29kZSI6Ijk4NjE5IiwiaWF0IjoxNjY4MzY3NTIyLCJleHAiOjE2NjgzNzExMjJ9.dbLwNXvxoHsAdn6Mc_3657yfpSlwq7ucEIpd3eaAzEc";
    cy.visit(magicLink);
}