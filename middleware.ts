export { default } from "next-auth/middleware"

export const config = { matcher: ["/create", "/update", "/", "/users", "/users/create", "/users/update"] }