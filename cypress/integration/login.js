export default function () {
    const magicLink = "http://localhost:3000/api/auth/magiclink/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWRpcmVjdCI6Ii8iLCJkZXN0aW5hdGlvbiI6ImFsaW5hdXJvemVAaG90bWFpbC5jb20iLCJyZW1lbWJlck1lIjp0cnVlLCJjb2RlIjoiMzg4NzAiLCJpYXQiOjE2NjgxMDkyMzgsImV4cCI6MTY2ODExMjgzOH0.L7pFliPHHBytEYIYdA5VIpWKeVX-H7r65Sa9mya75ng";
    cy.visit(magicLink);
}