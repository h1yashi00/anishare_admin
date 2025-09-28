import type { Route } from "./+types/_index";
import { useState } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "AniShare Admin - ダッシュボード" },
    { name: "description", content: "AniShare管理画面" },
  ];
}


export default function Index() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // ログアウト成功 - ログインページにリダイレクト
        window.location.href = '/login';
      } else {
        console.error('ログアウトに失敗しました');
      }
    } catch (error) {
      console.error('ログアウト中にエラーが発生しました:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AniShare Admin</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
