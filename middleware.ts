export { default } from "next-auth/middleware";

// Protect the admin dashboard (bare /admin) and everything under it, except the login page.
export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
