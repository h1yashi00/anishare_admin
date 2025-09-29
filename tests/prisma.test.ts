import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '../app/lib/prisma'

describe('Prisma Client', () => {
  it('Prismaクライアントが正しく初期化される', () => {
    expect(prisma).toBeDefined()
    expect(prisma.works).toBeDefined()
    expect(prisma.user).toBeDefined()
    expect(prisma.media).toBeDefined()
  })

  it('Prismaクライアントのメソッドが利用可能', () => {
    expect(typeof prisma.works.findMany).toBe('function')
    expect(typeof prisma.works.findUnique).toBe('function')
    expect(typeof prisma.user.findMany).toBe('function')
    expect(typeof prisma.media.findMany).toBe('function')
  })
})
