import type { Route } from "./+types/api.login";
import { handleLogin, envConfig } from "../middleware.server";

export async function action({ request }: Route.ActionArgs) {
  try {
    // Content-Typeに応じてデータを取得
    const contentType = request.headers.get('content-type') || '';
    let username: string, password: string;

    if (contentType.includes('application/json')) {
      // JSONデータを処理
      const body = await request.json();
      username = body.username || '';
      password = body.password || '';
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // URLエンコードされたデータを処理
      const body = await request.text();
      const params = new URLSearchParams(body);
      username = params.get('username') || '';
      password = params.get('password') || '';
    } else {
      // FormDataを処理
      const formData = await request.formData();
      username = formData.get("username") as string || '';
      password = formData.get("password") as string || '';
    }


    if (!username || !password) {
      return Response.json(
        { success: false, error: "ユーザー名とパスワードを入力してください。" },
        { status: 400 }
      );
    }

    // 環境変数から認証情報を取得
    const { username: validUsername, password: validPassword } = envConfig.credentials;

    if (username === validUsername && password === validPassword) {
      // 認証成功 - セッションCookieを作成
      const user = {
        id: '1',
        name: username,
        email: `${username}@admin.local`,
        avatar: '',
      };
      
      // 環境変数のハッシュを生成（変更検出用）
      const envHash = envConfig.envHash;
      
      const sessionData = {
        userId: user.id,
        username: user.name,
        email: user.email,
        loginTime: Date.now(),
        envHash: envHash, // 環境変数のハッシュを保存
      };
      
      const sessionToken = btoa(JSON.stringify(sessionData));
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間
      const cookie = `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires.toUTCString()}`;
      
      return Response.json(
        { success: true },
        {
          status: 200,
          headers: {
            "Set-Cookie": cookie,
          },
        }
      );
    } else {
      return Response.json(
        { success: false, error: "ユーザー名またはパスワードが正しくありません。" },
        { status: 401 }
      );
    }
  } catch (error) {
    return Response.json(
      { success: false, error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
