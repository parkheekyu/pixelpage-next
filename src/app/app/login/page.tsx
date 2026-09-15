import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    <div className="pp-login">
      <div className="box">
        <h1>픽셀페이지 대시보드</h1>
        <p>담당자에게 받은 계정으로 로그인하세요.</p>
        {configured ? (
          <LoginForm next={next ?? "/app"} />
        ) : (
          <div className="msg err">
            Supabase 환경 변수가 설정되지 않았습니다. <code>.env.local</code>에
            NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 를 넣어 주세요.
          </div>
        )}
      </div>
    </div>
  );
}
