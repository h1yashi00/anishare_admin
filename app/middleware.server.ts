import { redirect } from "react-router";
import type { Route } from "./+types/root";

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

// セッション管理用のユーティリティ関数
function createSessionCookie(user: User): string {
  const sessionData = {
    userId: user.id,
    username: user.name,
    email: user.email,
    loginTime: Date.now(),
  };
  
  const sessionToken = btoa(JSON.stringify(sessionData));
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間
  
  return `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires.toUTCString()}`;
}

function parseSessionCookie(cookieHeader: string | null): User | null {
  if (!cookieHeader) return null;
  
  try {
    console.log('Parsing cookie header:', cookieHeader);
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    console.log('Parsed cookies:', cookies);
    
    const sessionToken = cookies.session;
    if (!sessionToken) {
      console.log('No session token found');
      return null;
    }
    
    console.log('Session token found:', sessionToken);
    
    const sessionData = JSON.parse(atob(sessionToken));
    console.log('Session data:', sessionData);
    
    // セッションの有効期限をチェック（24時間）
    const now = Date.now();
    const sessionAge = now - sessionData.loginTime;
    const maxAge = 24 * 60 * 60 * 1000; // 24時間
    
    console.log('Session age check:', { now, loginTime: sessionData.loginTime, sessionAge, maxAge });
    
    if (sessionAge > maxAge) {
      console.log('Session expired');
      return null; // セッション期限切れ
    }
    
    const user = {
      id: sessionData.userId,
      name: sessionData.username,
      email: sessionData.email,
      avatar: '',
    };
    
    console.log('Returning user:', user);
    return user;
  } catch (error) {
    console.error('Error parsing session cookie:', error);
    return null;
  }
}

function clearSessionCookie(): string {
  return 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
// 認証が必要なパスかどうかを判定
function isProtectedPath(pathname: string): boolean {
  // ログイン画面とAPIエンドポイントは除外
  const publicPaths = ['/login', '/api/auth', '/api/login', '/api/logout', '/api/test'];
  return !publicPaths.some(path => pathname.startsWith(path));
}

export const authMiddleware: Route.MiddlewareFunction = async ({ request, context }: { request: Request; context: any }) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 保護されたパスでない場合は認証をスキップ
  if (!isProtectedPath(pathname)) {
    return;
  }

  // Cookieからセッション情報を取得
  const cookieHeader = request.headers.get('Cookie');
  const user = parseSessionCookie(cookieHeader);

  if (!user) {
    // セッションがない場合はログインページにリダイレクト
    throw redirect('/login?redirected=true');
  }

  // 認証成功 - コンテキストにユーザー情報を設定
  context.user = user;
};

// ログイン処理用の関数（ログインページから呼び出される）
export async function handleLogin(username: string, password: string): Promise<{ success: boolean; cookie?: string; error?: string }> {
  // 環境変数から認証情報を取得
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'admin';

  console.log('handleLogin called with:', { 
    username, 
    password: password ? '***' : 'empty',
    validUsername,
    validPassword: validPassword ? '***' : 'empty'
  });

  // 認証情報を検証
  if (username !== validUsername || password !== validPassword) {
    console.log('Authentication failed:', {
      usernameMatch: username === validUsername,
      passwordMatch: password === validPassword
    });
    return { success: false, error: 'invalid_credentials' };
  }

  // 認証成功 - セッションCookieを作成
  const user: User = {
    id: '1',
    name: username,
    email: `${username}@admin.local`,
    avatar: '',
  };

  const cookie = createSessionCookie(user);
  return { success: true, cookie };
}

// ログアウト処理用の関数
export function handleLogout(): string {
  return clearSessionCookie();
}
