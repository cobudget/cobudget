export default function () {
    const magicLink = "http://localhost:3000/api/auth/magiclink/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWRpcmVjdCI6Ii8iLCJkZXN0aW5hdGlvbiI6ImFsaW5hdXJvemVAaG90bWFpbC5jb20iLCJyZW1lbWJlck1lIjp0cnVlLCJjb2RlIjoiMTg0NDkiLCJpYXQiOjE2NjgxMDUzODgsImV4cCI6MTY2ODEwODk4OH0.kM4q30IE1rIkjfMj5vBaFFJ821HQ6eFVlweQl41yVyQ";
    cy.visit(magicLink);
}