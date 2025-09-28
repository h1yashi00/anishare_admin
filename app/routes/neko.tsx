import type { Route } from "./+types/neko";
import { redirect } from "react-router";

export function loader({ context }: Route.LoaderArgs) {
  return null;
}

export default function Neko() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Neko Page</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-lg text-gray-700">
            このページは認証が必要です。認証に成功したのでアクセスできています！
          </p>
        </div>
      </div>
    </div>
  );
} 