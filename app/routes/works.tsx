import type { Route } from "./+types/works";
import { useLoaderData } from "react-router";
import { getWorks } from "~/query/query";
import { useState } from "react";
import { FaHeart, FaBookmark, FaComment, FaCog, FaEye, FaTags, FaImage } from "react-icons/fa";
import { getS3Url } from "~/s3_client";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "AniShare Admin - 作品一覧" },
    { name: "description", content: "AniShare Admin 作品管理" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const works = await getWorks();
  return { works };
}

export default function Works() {
  const { works } = useLoaderData<typeof loader>();
  const [displaySettings, setDisplaySettings] = useState({
    showStats: true,
    showCategories: true,
    showTags: true,
    showMedia: true,
    showDescription: true,
    showAuthor: true,
    showCreatedAt: true,
    showViewCount: true
  });
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                AniShare Admin - 作品一覧
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <FaCog />
                表示設定
              </button>
              <a
                href="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ホーム
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 表示設定パネル */}
          {showSettings && (
            <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaEye />
                表示項目の設定
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 flex items-center gap-2">
                    <FaHeart className="text-red-500" />
                    統計情報
                  </h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={displaySettings.showStats}
                      onChange={(e) => setDisplaySettings(prev => ({ ...prev, showStats: e.target.checked }))}
                      className="mr-2 rounded"
                    />
                    いいね・ブックマーク・コメント数
                  </label>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 flex items-center gap-2">
                    <FaTags className="text-blue-500" />
                    分類情報
                  </h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={displaySettings.showCategories}
                      onChange={(e) => setDisplaySettings(prev => ({ ...prev, showCategories: e.target.checked }))}
                      className="mr-2 rounded"
                    />
                    カテゴリ
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={displaySettings.showTags}
                      onChange={(e) => setDisplaySettings(prev => ({ ...prev, showTags: e.target.checked }))}
                      className="mr-2 rounded"
                    />
                    タグ
                  </label>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 flex items-center gap-2">
                    <FaImage className="text-green-500" />
                    メディア情報
                  </h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={displaySettings.showMedia}
                      onChange={(e) => setDisplaySettings(prev => ({ ...prev, showMedia: e.target.checked }))}
                      className="mr-2 rounded"
                    />
                    作品画像
                  </label>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 flex items-center gap-2">
                    <FaEye className="text-purple-500" />
                    基本情報
                  </h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={displaySettings.showDescription}
                      onChange={(e) => setDisplaySettings(prev => ({ ...prev, showDescription: e.target.checked }))}
                      className="mr-2 rounded"
                    />
                    説明文
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={displaySettings.showAuthor}
                      onChange={(e) => setDisplaySettings(prev => ({ ...prev, showAuthor: e.target.checked }))}
                      className="mr-2 rounded"
                    />
                    作者情報
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={displaySettings.showCreatedAt}
                      onChange={(e) => setDisplaySettings(prev => ({ ...prev, showCreatedAt: e.target.checked }))}
                      className="mr-2 rounded"
                    />
                    作成日時
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={displaySettings.showViewCount}
                      onChange={(e) => setDisplaySettings(prev => ({ ...prev, showViewCount: e.target.checked }))}
                      className="mr-2 rounded"
                    />
                    閲覧数
                  </label>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex gap-2">
                  <button
                    onClick={() => setDisplaySettings({
                      showStats: true,
                      showCategories: true,
                      showTags: true,
                      showMedia: true,
                      showDescription: true,
                      showAuthor: true,
                      showCreatedAt: true,
                      showViewCount: true
                    })}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    すべて表示
                  </button>
                  <button
                    onClick={() => setDisplaySettings({
                      showStats: false,
                      showCategories: false,
                      showTags: false,
                      showMedia: false,
                      showDescription: false,
                      showAuthor: false,
                      showCreatedAt: false,
                      showViewCount: false
                    })}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    すべて非表示
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 統計情報 */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{works.length}</div>
              <div className="text-sm text-gray-600">総作品数</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center text-2xl font-bold text-green-600">
                <FaHeart className="mr-2" />
                {works.reduce((sum: number, work) => sum + work._count.LikeWork, 0)}
              </div>
              <div className="text-sm text-gray-600">総いいね数</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center text-2xl font-bold text-purple-600">
                <FaBookmark className="mr-2" />
                {works.reduce((sum: number, work) => sum + work._count.BookMarkWork, 0)}
              </div>
              <div className="text-sm text-gray-600">総ブックマーク数</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center text-2xl font-bold text-orange-600">
                <FaComment className="mr-2" />
                {works.reduce((sum: number, work) => sum + work._count.WorkComment, 0)}
              </div>
              <div className="text-sm text-gray-600">総コメント数</div>
            </div>
          </div>

          {/* 作品一覧 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                作品一覧 ({works.length}件)
              </h2>

              {works.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">作品が見つかりませんでした。</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {works.map((work) => (
                    <div key={work.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      {/* 作品画像 */}
                      {displaySettings.showMedia && (
                        <div className="mb-4">
                          {work.workMedia.length > 0 ? (
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                              <img
                                src={getS3Url(work.workMedia[0].media.key)}
                                alt={work.title}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (nextElement) {
                                    nextElement.style.display = 'flex';
                                  }
                                }}
                              />
                              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500" style={{ display: 'none' }}>
                                <span>画像なし</span>
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                              <span>画像なし</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 作品情報 */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 truncate" title={work.title}>
                          {work.title}
                        </h3>

                        {displaySettings.showAuthor && (
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium">作者:</span>
                            <span className="ml-1">{work.user.name}</span>
                          </div>
                        )}

                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium">スタイル:</span>
                          <span className="ml-1">{work.style.name}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium">制作時間:</span>
                          <span className="ml-1">{work.timeHour}時間{work.timeMinute}分</span>
                        </div>

                        {displaySettings.showViewCount && (
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium">閲覧数:</span>
                            <span className="ml-1">{work.viewCount.toLocaleString()}</span>
                          </div>
                        )}

                        {/* カテゴリ */}
                        {displaySettings.showCategories && work.workCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {work.workCategories.map((wc) => (
                              <span
                                key={wc.category.id}
                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                              >
                                {wc.category.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* タグ */}
                        {displaySettings.showTags && work.workTags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {work.workTags.slice(0, 3).map((wt) => (
                              <span
                                key={wt.tag.id}
                                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                              >
                                #{wt.tag.name}
                              </span>
                            ))}
                            {work.workTags.length > 3 && (
                              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                +{work.workTags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* 統計情報 */}
                        {displaySettings.showStats && (
                          <div className="flex justify-between text-sm text-gray-600 pt-2 border-t">
                            <span className="flex items-center">
                              <FaHeart className="mr-1 text-red-500" />
                              {work._count.LikeWork}
                            </span>
                            <span className="flex items-center">
                              <FaBookmark className="mr-1 text-purple-500" />
                              {work._count.BookMarkWork}
                            </span>
                            <span className="flex items-center">
                              <FaComment className="mr-1 text-blue-500" />
                              {work._count.WorkComment}
                            </span>
                          </div>
                        )}

                        {/* 作成日時 */}
                        {displaySettings.showCreatedAt && (
                          <div className="text-xs text-gray-500">
                            {new Date(work.createdAt).toLocaleDateString('ja-JP')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

