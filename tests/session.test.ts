import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createSessionCookie, parseSessionCookie, clearSessionCookie } from '../app/middleware.server'

describe('Session Management', () => {
  let originalUsername: string | undefined
  let originalPassword: string | undefined

  beforeEach(() => {
    // 元の環境変数を保存
    originalUsername = process.env.ADMIN_USERNAME
    originalPassword = process.env.ADMIN_PASSWORD
  })

  afterEach(() => {
    // 環境変数を元に戻す
    if (originalUsername !== undefined) {
      process.env.ADMIN_USERNAME = originalUsername
    } else {
      delete process.env.ADMIN_USERNAME
    }
    
    if (originalPassword !== undefined) {
      process.env.ADMIN_PASSWORD = originalPassword
    } else {
      delete process.env.ADMIN_PASSWORD
    }
  })

  describe('createSessionCookie', () => {
    beforeEach(() => {
      process.env.ADMIN_USERNAME = 'testuser'
      process.env.ADMIN_PASSWORD = 'testpass'
    })

    it('正しいセッションCookieを生成する', () => {
      const user = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com',
        avatar: ''
      }

      const cookie = createSessionCookie(user)
      
      expect(cookie).toContain('session=')
      expect(cookie).toContain('Path=/')
      expect(cookie).toContain('HttpOnly')
      expect(cookie).toContain('Secure')
      expect(cookie).toContain('SameSite=Strict')
      expect(cookie).toContain('Expires=')
    })

    it('セッションCookieに環境変数ハッシュが含まれる', () => {
      const user = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com',
        avatar: ''
      }

      const cookie = createSessionCookie(user)
      const sessionMatch = cookie.match(/session=([^;]+)/)
      expect(sessionMatch).toBeDefined()
      
      const sessionData = JSON.parse(atob(sessionMatch![1]))
      expect(sessionData.envHash).toBe(btoa('testuser:testpass'))
    })
  })

  describe('parseSessionCookie', () => {
    beforeEach(() => {
      process.env.ADMIN_USERNAME = 'testuser'
      process.env.ADMIN_PASSWORD = 'testpass'
    })

    it('有効なセッションCookieを正しく解析する', () => {
      const user = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com',
        avatar: ''
      }

      const cookie = createSessionCookie(user)
      const sessionMatch = cookie.match(/session=([^;]+)/)
      const cookieHeader = `session=${sessionMatch![1]}`
      
      const parsedUser = parseSessionCookie(cookieHeader)
      
      expect(parsedUser).not.toBeNull()
      expect(parsedUser!.id).toBe('1')
      expect(parsedUser!.name).toBe('testuser')
      expect(parsedUser!.email).toBe('test@example.com')
    })

    it('Cookieヘッダーがnullの場合はnullを返す', () => {
      const result = parseSessionCookie(null)
      expect(result).toBeNull()
    })

    it('無効なCookieヘッダーの場合はnullを返す', () => {
      const result = parseSessionCookie('invalid-cookie')
      expect(result).toBeNull()
    })

    it('セッションCookieが存在しない場合はnullを返す', () => {
      const result = parseSessionCookie('other=value')
      expect(result).toBeNull()
    })

    it('期限切れのセッションはnullを返す', () => {
      const user = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com',
        avatar: ''
      }

      // 期限切れのセッションデータを作成
      const expiredSessionData = {
        userId: user.id,
        username: user.name,
        email: user.email,
        loginTime: Date.now() - (25 * 60 * 60 * 1000), // 25時間前
        envHash: btoa('testuser:testpass')
      }

      const expiredCookie = `session=${btoa(JSON.stringify(expiredSessionData))}`
      const result = parseSessionCookie(expiredCookie)
      
      expect(result).toBeNull()
    })

    it('環境変数が変更された場合はnullを返す', () => {
      const user = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com',
        avatar: ''
      }

      // 古い環境変数でセッションを作成
      const oldSessionData = {
        userId: user.id,
        username: user.name,
        email: user.email,
        loginTime: Date.now(),
        envHash: btoa('olduser:oldpass')
      }

      const oldCookie = `session=${btoa(JSON.stringify(oldSessionData))}`
      const result = parseSessionCookie(oldCookie)
      
      expect(result).toBeNull()
    })
  })

  describe('clearSessionCookie', () => {
    it('正しいクリアCookieを返す', () => {
      const clearCookie = clearSessionCookie()
      
      expect(clearCookie).toBe('session=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
    })
  })

  describe('環境変数変更によるセッション無効化', () => {
    it('環境変数変更時に既存セッションが無効化される', () => {
      // 最初の環境変数でセッションを作成
      process.env.ADMIN_USERNAME = 'user1'
      process.env.ADMIN_PASSWORD = 'pass1'
      
      const user = {
        id: '1',
        name: 'user1',
        email: 'user1@example.com',
        avatar: ''
      }

      const cookie1 = createSessionCookie(user)
      const sessionMatch1 = cookie1.match(/session=([^;]+)/)
      const cookieHeader1 = `session=${sessionMatch1![1]}`
      
      // 最初の環境変数では有効
      const result1 = parseSessionCookie(cookieHeader1)
      expect(result1).not.toBeNull()

      // 環境変数を変更
      process.env.ADMIN_USERNAME = 'user2'
      process.env.ADMIN_PASSWORD = 'pass2'

      // 古いセッションは無効化される
      const result2 = parseSessionCookie(cookieHeader1)
      expect(result2).toBeNull()

      // 新しい環境変数で新しいセッションを作成
      const user2 = {
        id: '2',
        name: 'user2',
        email: 'user2@example.com',
        avatar: ''
      }

      const cookie2 = createSessionCookie(user2)
      const sessionMatch2 = cookie2.match(/session=([^;]+)/)
      const cookieHeader2 = `session=${sessionMatch2![1]}`
      
      // 新しいセッションは有効
      const result3 = parseSessionCookie(cookieHeader2)
      expect(result3).not.toBeNull()
      expect(result3!.name).toBe('user2')
    })
  })
})
