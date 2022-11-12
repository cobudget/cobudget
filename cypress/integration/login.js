export default function () {
    const magicLink = "http://localhost:3000/api/auth/magiclink/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWRpcmVjdCI6Ii8iLCJkZXN0aW5hdGlvbiI6ImFsaW5hdXJvemVAaG90bWFpbC5jb20iLCJyZW1lbWJlck1lIjp0cnVlLCJjb2RlIjoiOTYwMDAiLCJpYXQiOjE2NjgyNDYxNDQsImV4cCI6MTY2ODI0OTc0NH0._JTLUHZx2Y5YlTz3-BeAvVtqmVo7HCLzmYjm5mCVMOo";
    cy.visit(magicLink);
}