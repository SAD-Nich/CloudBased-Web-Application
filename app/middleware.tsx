import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  if (url.pathname === "/") {
    const lastPath = req.cookies.get("lastPath")?.value;
    if (lastPath && lastPath !== "/") {
      return NextResponse.redirect(new URL(lastPath, url.origin));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};