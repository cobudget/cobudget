export default function () {
    const magicLink = "http://localhost:3000/api/auth/magiclink/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWRpcmVjdCI6Ii8iLCJkZXN0aW5hdGlvbiI6ImFsaW5hdXJvemVAaG90bWFpbC5jb20iLCJyZW1lbWJlck1lIjpmYWxzZSwiY29kZSI6IjMxNDU0IiwiaWF0IjoxNjY4Mjc5NzI5LCJleHAiOjE2NjgyODMzMjl9.xAnkFh2NBFLjGGu63AAaUPQu-nll35dj3KDhFeMU2F4";
    cy.visit(magicLink);
}