export default function () {
    const magicLink = "http://localhost:3000/api/auth/magiclink/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWRpcmVjdCI6Ii8iLCJkZXN0aW5hdGlvbiI6ImFsaW5hdXJvemVAaG90bWFpbC5jb20iLCJyZW1lbWJlck1lIjpmYWxzZSwiY29kZSI6IjY0MzUzIiwiaWF0IjoxNjY4MzYzNTI1LCJleHAiOjE2NjgzNjcxMjV9.NjAJzYStjbMa999oLQ94paYjdfIYTSHXknx9W6gBbVg";
    cy.visit(magicLink);
}