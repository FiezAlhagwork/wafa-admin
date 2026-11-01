import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Clerk protects the dashboard only. /sign-in and the whole website stay public.
// next-intl joins here in step 6, running on website routes only (never /admin, /sign-in or /api).
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Everything except Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
