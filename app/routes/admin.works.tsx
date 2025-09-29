import { redirect, useLoaderData, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router"
import { parseSessionCookie } from "~/middleware.server"
import { getAdminWorks, forcePrivateWork, restoreWork } from "~/query/query"
import { useState } from "react"
import { FaCog, FaEye, FaEyeSlash, FaHeart, FaBookmark, FaComment, FaTags, FaImage } from "react-icons/fa"

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  // Cookieからセッション情報を取得
  const cookieHeader = request.headers.get('Cookie')
  const user = parseSessionCookie(cookieHeader)
  
  // 管理者権限チェック（ここでは簡単にユーザーIDで判定）
  // 実際の実装では、管理者権限テーブルやロールベースの認証を使用してください
  if (!user || user.id !== '1') { // 仮にユーザーID 1を管理者とする
    return redirect("/")
  }

  // 作品一覧を取得
  const works = await getAdminWorks()

  return { works }
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  // Cookieからセッション情報を取得
  const cookieHeader = request.headers.get('Cookie')
  const user = parseSessionCookie(cookieHeader)
  
  // 管理者権限チェック
  if (!user || user.id !== '1') {
    return redirect("/")
  }

  const formData = await request.formData()
  const action = formData.get('action') as string
  const slug = formData.get('slug') as string

  try {
    if (action === 'force-private') {
      await forcePrivateWork(slug)
    } else if (action === 'restore') {
      await restoreWork(slug)
    }
    
    return redirect('/admin/works')
  } catch (error) {
    console.error('Action failed:', error)
    return redirect('/admin/works')
  }
}

export default function AdminWorks() {
  const { works } = useLoaderData<typeof loader>()
  const [displaySettings, setDisplaySettings] = useState({
    showStats: true,
    showCategories: true,
    showTags: true,
    showMedia: true,
    showDescription: true,
    showAuthor: true,
    showCreatedAt: true,
    showViewCount: true
  })
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">作品管理</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <FaCog />
          表示設定
        </button>
      </div>

      {/* 表示設定Card */}
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
      
      <div className="grid gap-4">
        {works.map((work: any) => (
          <div key={work.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{work.title}</h3>
                {displaySettings.showDescription && (
                  <p className="text-gray-600 text-sm">{work.description}</p>
                )}
                <div className="text-gray-500 text-xs mt-2 space-y-1">
                  {displaySettings.showAuthor && (
                    <p>作成者: {work.user.name} (@{work.user.username})</p>
                  )}
                  {displaySettings.showCreatedAt && (
                    <p>作成日: {new Date(work.createdAt).toLocaleDateString()}</p>
                  )}
                  {displaySettings.showViewCount && (
                    <p>視聴回数: {work.viewCount} PV</p>
                  )}
                </div>
                
                {/* カテゴリ表示 */}
                {displaySettings.showCategories && work.workCategories.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {work.workCategories.map((wc: any) => (
                        <span
                          key={wc.category.id}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {wc.category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* タグ表示 */}
                {displaySettings.showTags && work.workTags.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {work.workTags.slice(0, 5).map((wt: any) => (
                        <span
                          key={wt.tag.id}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                        >
                          #{wt.tag.name}
                        </span>
                      ))}
                      {work.workTags.length > 5 && (
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          +{work.workTags.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 統計情報表示 */}
                {displaySettings.showStats && (
                  <div className="mt-2 flex gap-4 text-sm text-gray-600">
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
              </div>
              
              <div className="flex flex-col gap-2 ml-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  work.visibility === 1 
                    ? 'bg-green-100 text-green-800' 
                    : work.visibility === 2
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {work.visibility === 1 ? '公開中' : work.visibility === 2 ? '非公開' : '強制非公開'}
                </span>
                
                <div className="flex gap-2">
                  {work.visibility !== 3 && (
                    <form method="post" action={`/admin/works/${work.slug}/force-private`}>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                      >
                        強制非公開
                      </button>
                    </form>
                  )}
                  
                  {work.visibility === 3 && (
                    <form method="post" action={`/admin/works/${work.slug}/restore`}>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors"
                      >
                        制限解除
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
