import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Clerk protects the dashboard only. /sign-in and the whole website stay public.
// next-intl runs on website routes only (never /admin, /sign-in, /dev or /api).
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isDashboardOrApi = createRouteMatcher(["/admin(.*)", "/sign-in(.*)", "/dev(.*)", "/api(.*)", "/trpc(.*)"]);

const intlMiddleware = createIntlMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) await auth.protect();
  if (!isDashboardOrApi(req)) return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Everything except Next.js internals and static files
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
