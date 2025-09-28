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
  // 環境変数のハッシュを生成（変更検出用）
  const { username, password } = getEnvCredentials();
  const envHash = btoa(`${username}:${password}`);
  
  const sessionData = {
    userId: user.id,
    username: user.name,
    email: user.email,
    loginTime: Date.now(),
    envHash: envHash, // 環境変数のハッシュを保存
  };
  
  const sessionToken = btoa(JSON.stringify(sessionData));
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間
  
  return `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires.toUTCString()}`;
}

function parseSessionCookie(cookieHeader: string | null): User | null {
  if (!cookieHeader) return null;
  
  try {
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    
    const sessionToken = cookies.session;
    if (!sessionToken) {
      return null;
    }
    
    
    const sessionData = JSON.parse(atob(sessionToken));
    
    // セッションの有効期限をチェック（24時間）
    const now = Date.now();
    const sessionAge = now - sessionData.loginTime;
    const maxAge = 24 * 60 * 60 * 1000; // 24時間
    
    
    if (sessionAge > maxAge) {
      return null; // セッション期限切れ
    }
    
    // 環境変数の変更をチェック（セッション無効化）
    const { username, password } = getEnvCredentials();
    const currentEnvHash = btoa(`${username}:${password}`);
    
    // セッション作成時の環境変数ハッシュと現在のハッシュが異なる場合は無効化
    if (sessionData.envHash !== currentEnvHash) {
      return null; // 環境変数が変更された
    }
    
    const user = {
      id: sessionData.userId,
      name: sessionData.username,
      email: sessionData.email,
      avatar: '',
    };
    
    return user;
  } catch (error) {
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
  
  // 環境変数の読み込み状況を確認
  console.log('Environment variables:');
  console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME || 'undefined (using default: neko)');
  console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD || 'undefined (using default: neko)');

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

// 環境変数を読み込む関数
function getEnvCredentials() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  
  console.log('Environment variables check:');
  console.log('ADMIN_USERNAME:', username || 'undefined');
  console.log('ADMIN_PASSWORD:', password || 'undefined');
  
  // 環境変数が設定されていない場合はデフォルト値を使用
  return {
    username: username || 'neko',
    password: password || 'neko'
  };
}

// ログイン処理用の関数（ログインページから呼び出される）
export async function handleLogin(username: string, password: string): Promise<{ success: boolean; cookie?: string; error?: string }> {
  // 環境変数から認証情報を取得
  const { username: validUsername, password: validPassword } = getEnvCredentials();


  // 認証情報を検証
  if (username !== validUsername || password !== validPassword) {
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
