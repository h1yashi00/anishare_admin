import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs, type MetaFunction, useLoaderData } from "react-router";
import { useState } from "react";
import { prisma } from "~/lib/prisma";
import { getActiveEvents, getAllEvents } from "~/query/query";
import { upload, deleteFile, getS3Url, extractKeyFromS3Url } from "~/s3_client";
import TiptapEditor from "~/components/TiptapEditor";

export const meta: MetaFunction = () => {
  return [
    { title: "イベント管理 | anishare" },
    { name: "description", content: "イベントの管理画面" },
  ];
};

// 画像アップロード処理のヘルパー関数
async function handleImageUpload(imageFile: File | null): Promise<string> {
  if (!imageFile) {
    return "";
  }

  // ファイルサイズチェック（5MB制限）
  if (imageFile.size > 5 * 1024 * 1024) {
    throw new Error("画像ファイルのサイズが大きすぎます（最大5MB）");
  }

  // ファイル形式チェック
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(imageFile.type)) {
    throw new Error("サポートされていない画像形式です（JPG、PNG、GIF、WebPのみ）");
  }

  // ファイル名を生成（タイムスタンプ + ランダム文字列）
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = imageFile.name.split('.').pop();
  const fileName = `event_${timestamp}_${randomString}.${extension}`;

  // S3にアップロード
  const key = `event-images/${fileName}`;
  await upload(key, imageFile, imageFile.type);

  // S3のURLを返す
  return getS3Url(key);
}

export const loader = async ({ request, context }: LoaderFunctionArgs) => {

  const activeEvents = await getActiveEvents();
  const allEvents = await getAllEvents();

  return { activeEvents, allEvents };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "create") {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const tagName = formData.get("tagName") as string;
    const imageFile = formData.get("image") as File | null;
    const thumbnailFile = formData.get("thumbnail") as File | null;

    let imageUrl = "";
    let thumbnailUrl = "";
    
    try {
      imageUrl = await handleImageUpload(imageFile);
    } catch (error) {
      console.error("画像アップロードエラー:", error);
      // エラーが発生した場合は画像なしでイベントを作成
    }
    
    try {
      thumbnailUrl = await handleImageUpload(thumbnailFile);
    } catch (error) {
      console.error("サムネイル画像アップロードエラー:", error);
      // エラーが発生した場合はサムネイル画像なしでイベントを作成
    }

    await prisma.event.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        tagName: tagName,
        imageUrl,
        thumbnailUrl,
        isActive: true,
      },
    });

    return redirect("/events");
  }

  if (action === "update") {
    const id = Number(formData.get("id"));
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const tagName = formData.get("tagName") as string;
    const isActive = formData.get("isActive") === "true";
    const imageFile = formData.get("image") as File | null;
    const thumbnailFile = formData.get("thumbnail") as File | null;

    // 既存のイベント情報を取得
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    let imageUrl = existingEvent?.imageUrl || "";
    let thumbnailUrl = existingEvent?.thumbnailUrl || "";
    
    // 新しい画像がアップロードされた場合のみ処理
    if (imageFile && imageFile.size > 0) {
      try {
        // 古い画像を削除
        if (existingEvent?.imageUrl) {
          const key = extractKeyFromS3Url(existingEvent.imageUrl);
          if (key) {
            await deleteFile(key);
          }
        }
        imageUrl = await handleImageUpload(imageFile);
      } catch (error) {
        console.error("画像アップロードエラー:", error);
        // エラーが発生した場合は既存の画像URLを維持
        imageUrl = existingEvent?.imageUrl || "";
      }
    }
    
    // 新しいサムネイル画像がアップロードされた場合のみ処理
    if (thumbnailFile && thumbnailFile.size > 0) {
      try {
        // 古いサムネイル画像を削除
        if (existingEvent?.thumbnailUrl) {
          const key = extractKeyFromS3Url(existingEvent.thumbnailUrl);
          if (key) {
            await deleteFile(key);
          }
        }
        thumbnailUrl = await handleImageUpload(thumbnailFile);
      } catch (error) {
        console.error("サムネイル画像アップロードエラー:", error);
        // エラーが発生した場合は既存のサムネイル画像URLを維持
        thumbnailUrl = existingEvent?.thumbnailUrl || "";
      }
    }

    await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        startDate,
        endDate,
        tagName: tagName,
        imageUrl,
        thumbnailUrl,
        isActive,
      },
    });

    return redirect("/events");
  }

  if (action === "delete") {
    const id = Number(formData.get("id"));

    // 削除前にイベント情報を取得して画像URLを保存
    const event = await prisma.event.findUnique({
      where: { id }
    });

    // イベントを削除
    await prisma.event.delete({
      where: { id },
    });

    // 画像ファイルも削除
    if (event?.imageUrl) {
      const key = extractKeyFromS3Url(event.imageUrl);
      if (key) {
        await deleteFile(key);
      }
    }
    
    // サムネイル画像ファイルも削除
    if (event?.thumbnailUrl) {
      const key = extractKeyFromS3Url(event.thumbnailUrl);
      if (key) {
        await deleteFile(key);
      }
    }

    return redirect("/events");
  }

  return null;
};

export default function AdminEvents() {
  const { allEvents } = useLoaderData<typeof loader>();
  const [editingEvent, setEditingEvent] = useState<number | null>(null);
  const [newEventDescription, setNewEventDescription] = useState<string>("");
  const [editingEventDescription, setEditingEventDescription] = useState<string>("");

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-6xl mx-auto p-6">

        {/* 新しいイベント作成フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">新しいイベントを作成</h2>
          <form method="post" encType="multipart/form-data" className="space-y-4">
            <input type="hidden" name="action" value="create" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイトル
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="イベントタイトル"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <TiptapEditor
                content={newEventDescription}
                onChange={setNewEventDescription}
                placeholder="イベントの説明を入力してください..."
                editable={true}
              />
              <input
                type="hidden"
                name="description"
                value={newEventDescription}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タグ名
              </label>
              <input
                type="text"
                name="tagName"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="イベントのタグ名（任意）"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  イベント画像
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  メイン画像（最大5MB）
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  サムネイル画像
                </label>
                <input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  サムネイル用（最大5MB）
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開始日時
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  終了日時
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              イベントを作成
            </button>
          </form>
        </div>

        {/* 既存のイベント一覧 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">イベント一覧</h2>
          <div className="space-y-4">
            {allEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">イベントがありません。</p>
            ) : (
              <div className="space-y-4">
                {allEvents.map((event) => {
                  const now = new Date();
                  const startDate = new Date(event.startDate);
                  const endDate = new Date(event.endDate);
                  const isActive = event.isActive && now >= startDate && now <= endDate;
                  const isUpcoming = now < startDate;
                  const isEnded = now > endDate;

                  return (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex gap-4">
                            {(event.imageUrl || event.thumbnailUrl) && (
                              <div className="flex-shrink-0">
                                <img
                                  src={event.thumbnailUrl || event.imageUrl || ""}
                                  alt={event.title}
                                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {event.title}
                              </h3>
                              <div className="text-gray-600 text-sm mb-2">
                                <TiptapEditor
                                  content={event.description}
                                  onChange={() => {}}
                                  editable={false}
                                  className="text-sm"
                                />
                              </div>
                              {event.tagName && (
                                <div className="mb-2">
                                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    {event.tagName}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>
                                  開始: {startDate.toLocaleString('ja-JP')}
                                </span>
                                <span>
                                  終了: {endDate.toLocaleString('ja-JP')}
                                </span>
                                <span className="flex items-center">
                                  参加作品数: {event.eventWorks.length}件
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive
                            ? 'bg-green-100 text-green-800'
                            : isUpcoming
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {isActive ? '開催中' : isUpcoming ? '開催予定' : '終了'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.isActive
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {event.isActive ? '有効' : '無効'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingEvent(event.id);
                            setEditingEventDescription(event.description);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                        >
                          編集
                        </button>

                        <form method="post" className="inline">
                          <input type="hidden" name="action" value="update" />
                          <input type="hidden" name="id" value={event.id} />
                          <input type="hidden" name="title" value={event.title} />
                          <input type="hidden" name="description" value={event.description} />
                          <input type="hidden" name="tagName" value={event.tagName || ""} />
                          <input type="hidden" name="startDate" value={startDate.toISOString().slice(0, 16)} />
                          <input type="hidden" name="endDate" value={endDate.toISOString().slice(0, 16)} />
                          <input type="hidden" name="isActive" value={(!event.isActive).toString()} />
                          <button
                            type="submit"
                            className={`px-3 py-1 rounded text-sm ${event.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                          >
                            {event.isActive ? '無効化' : '有効化'}
                          </button>
                        </form>

                        <form method="post" className="inline">
                          <input type="hidden" name="action" value="delete" />
                          <input type="hidden" name="id" value={event.id} />
                          <button
                            type="submit"
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                            onClick={(e) => {
                              if (!confirm('このイベントを削除しますか？この操作は取り消せません。')) {
                                e.preventDefault();
                              }
                            }}
                          >
                            削除
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 編集フォーム */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">イベントを編集</h2>
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setEditingEventDescription("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {(() => {
                const event = allEvents.find(e => e.id === editingEvent);
                if (!event) return null;
                
                return (
                  <form method="post" encType="multipart/form-data" className="space-y-4">
                    <input type="hidden" name="action" value="update" />
                    <input type="hidden" name="id" value={event.id} />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        タイトル
                      </label>
                      <input
                        type="text"
                        name="title"
                        defaultValue={event.title}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="イベントタイトル"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        説明
                      </label>
                      <TiptapEditor
                        content={editingEventDescription || event.description}
                        onChange={setEditingEventDescription}
                        placeholder="イベントの説明を入力してください..."
                        editable={true}
                      />
                      <input
                        type="hidden"
                        name="description"
                        value={editingEventDescription || event.description}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        タグ名
                      </label>
                      <input
                        type="text"
                        name="tagName"
                        defaultValue={event.tagName || ""}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="イベントのタグ名（任意）"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          イベント画像
                        </label>
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          新しい画像を選択（現在の画像を変更する場合のみ）
                        </p>
                        {event.imageUrl && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-1">現在の画像:</p>
                            <img
                              src={event.imageUrl}
                              alt="現在の画像"
                              className="w-20 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          サムネイル画像
                        </label>
                        <input
                          type="file"
                          name="thumbnail"
                          accept="image/*"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          新しいサムネイルを選択（現在のサムネイルを変更する場合のみ）
                        </p>
                        {event.thumbnailUrl && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-1">現在のサムネイル:</p>
                            <img
                              src={event.thumbnailUrl}
                              alt="現在のサムネイル"
                              className="w-20 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          開始日時
                        </label>
                        <input
                          type="datetime-local"
                          name="startDate"
                          defaultValue={new Date(event.startDate).toISOString().slice(0, 16)}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          終了日時
                        </label>
                        <input
                          type="datetime-local"
                          name="endDate"
                          defaultValue={new Date(event.endDate).toISOString().slice(0, 16)}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isActive"
                          value="true"
                          defaultChecked={event.isActive}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">イベントを有効にする</span>
                      </label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEvent(null);
                          setEditingEventDescription("");
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        更新
                      </button>
                    </div>
                  </form>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}