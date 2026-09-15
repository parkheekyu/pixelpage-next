import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * /app/* 보호: 세션 쿠키를 갱신하고, 로그인하지 않은 사용자는 /app/login 으로 보낸다.
 * DB 조회는 하지 않는다 (낙관적 검사). 실제 권한은 각 페이지/서버 액션에서 재검증.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/app/login";

  if (!url || !anon) {
    // Supabase 미설정: 로그인 페이지에서 안내만 보여준다
    return isLogin ? response : NextResponse.redirect(new URL("/app/login", request.url));
  }

  const supabase = createServerClient(url, anon, {
    db: { schema: "dash" },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const login = new URL("/app/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  if (user && isLogin) {
    return NextResponse.redirect(new URL("/app", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/app/:path*"],
};
