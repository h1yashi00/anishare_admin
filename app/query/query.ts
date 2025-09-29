import { prisma } from "~/lib/prisma";

// 作品一覧を取得（関連データも含める）
export async function getWorks() {
  return await prisma.works.findMany({
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
  });
}

// 管理者用：作品一覧を取得（関連データも含める）
export async function getAdminWorks() {
  return await prisma.works.findMany({
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
  });
}

// 作品の可視性を強制非公開に変更
export async function forcePrivateWork(slug: string) {
  return await prisma.works.update({
    where: { slug },
    data: { visibility: 3 }
  });
}

// 作品の可視性を制限解除（公開に戻す）
export async function restoreWork(slug: string) {
  return await prisma.works.update({
    where: { slug },
    data: { visibility: 1 }
  });
}