export default function () {
    const magicLink = "http://localhost:3000/api/auth/magiclink/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWRpcmVjdCI6Ii8iLCJkZXN0aW5hdGlvbiI6ImFsaW5hdXJvemVAaG90bWFpbC5jb20iLCJyZW1lbWJlck1lIjpmYWxzZSwiY29kZSI6IjUzODkxIiwiaWF0IjoxNjY4NDU1OTMwLCJleHAiOjE2Njg0NTk1MzB9.e5mppP_6iod4C7Ayims9ua7KW0HqZq5lPg_hk3a3qqM";
    cy.visit(magicLink);
}