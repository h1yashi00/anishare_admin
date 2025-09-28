import type { Route } from "./+types/login";
import { useState, useEffect } from "react";
import { useLocation } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "ログイン - AniShare Admin" },
    { name: "description", content: "管理者ログイン" },
  ];
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // URLパラメータからエラーメッセージを取得
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const errorParam = searchParams.get('error');
    if (errorParam === 'invalid_credentials') {
      setError("ユーザー名またはパスワードが正しくありません。");
    }
  }, [location.search]);

  // リダイレクトされたかどうかを判定
  const searchParams = new URLSearchParams(location.search);
  const isRedirected = searchParams.has('redirected');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // ログインAPIにPOSTリクエストを送信
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('/api/login', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // 認証成功 - ホームページにリダイレクト
        window.location.href = '/';
      } else {
        setError(result.error || "ログイン中にエラーが発生しました。");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("ログイン中にエラーが発生しました。ネットワーク接続を確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            AniShare Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            管理者ログイン
          </p>
          {isRedirected && (
            <div className="mt-4 rounded-md bg-yellow-50 p-4">
              <div className="text-sm text-yellow-800 text-center">
                認証が必要なページにアクセスしようとしました。ログインしてください。
              </div>
            </div>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                ユーザー名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="ユーザー名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              デフォルト: neko / neko
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
