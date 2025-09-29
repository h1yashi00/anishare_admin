import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { prisma } from '../app/lib/prisma'

// Prismaクライアントをモック
vi.mock('../app/lib/prisma', () => ({
  prisma: {
    works: {
      findMany: vi.fn()
    }
  }
}))

describe('Works API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('作品一覧APIが正しく動作する', async () => {
    // モックデータ
    const mockWorks = [
      {
        id: 1,
        title: 'テスト作品1',
        slug: 'test-work-1',
        description: 'テスト作品の説明',
        viewCount: 100,
        timeHour: 2,
        timeMinute: 30,
        userId: 1,
        styleId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        user: {
          id: 1,
          name: 'テストユーザー',
          username: 'testuser'
        },
        style: {
          id: 1,
          name: 'デジタル'
        },
        workCategories: [],
        workTags: [],
        workMedia: [],
        _count: {
          LikeWork: 5,
          BookMarkWork: 3,
          WorkComment: 2
        }
      }
    ]

    // Prismaのモックを設定
    vi.mocked(prisma.works.findMany).mockResolvedValue(mockWorks)

    // APIエンドポイントを動的にインポート
    const { loader } = await import('../app/routes/api.works')
    
    // モックリクエストを作成
    const mockRequest = new Request('http://localhost:3000/api/works')
    
    // loaderを実行
    const response = await loader({ request: mockRequest } as any)
    const data = await response.json()

    // 結果を検証
    expect(data.success).toBe(true)
    expect(data.works).toHaveLength(1)
    expect(data.works[0].id).toBe(1)
    expect(data.works[0].title).toBe('テスト作品1')
    expect(data.works[0].user.name).toBe('テストユーザー')
    expect(data.works[0].style.name).toBe('デジタル')
    expect(data.works[0]._count.LikeWork).toBe(5)
    expect(prisma.works.findMany).toHaveBeenCalledWith({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          }
        },
        style: {
          select: {
            id: true,
            name: true,
          }
        },
        workCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        workTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        workMedia: {
          include: {
            media: {
              select: {
                id: true,
                originalFilename: true,
                key: true,
                bucketName: true,
                type: true,
                width: true,
                height: true,
                mimeType: true,
              }
            }
          }
        },
        _count: {
          select: {
            LikeWork: true,
            BookMarkWork: true,
            WorkComment: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  })

  it('データベースエラー時に適切なエラーレスポンスを返す', async () => {
    // Prismaのモックでエラーを発生させる
    vi.mocked(prisma.works.findMany).mockRejectedValue(new Error('Database connection failed'))

    // APIエンドポイントを動的にインポート
    const { loader } = await import('../app/routes/api.works')
    
    // モックリクエストを作成
    const mockRequest = new Request('http://localhost:3000/api/works')
    
    // loaderを実行
    const response = await loader({ request: mockRequest } as any)
    const data = await response.json()

    // エラーレスポンスを検証
    expect(data.success).toBe(false)
    expect(data.error).toBe('作品一覧の取得に失敗しました。')
    expect(response.status).toBe(500)
  })
})
