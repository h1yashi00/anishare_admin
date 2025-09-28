import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { handleLogin } from '../app/middleware.server'

describe('handleLogin', () => {
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

  describe('環境変数が設定されている場合', () => {
    beforeEach(() => {
      process.env.ADMIN_USERNAME = 'testuser'
      process.env.ADMIN_PASSWORD = 'testpass'
    })

    it('正しい認証情報でログインが成功する', async () => {
      const result = await handleLogin('testuser', 'testpass')
      
      expect(result.success).toBe(true)
      expect(result.cookie).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    it('間違ったユーザー名でログインが失敗する', async () => {
      const result = await handleLogin('wronguser', 'testpass')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('invalid_credentials')
      expect(result.cookie).toBeUndefined()
    })

    it('間違ったパスワードでログインが失敗する', async () => {
      const result = await handleLogin('testuser', 'wrongpass')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('invalid_credentials')
      expect(result.cookie).toBeUndefined()
    })

    it('空の認証情報でログインが失敗する', async () => {
      const result = await handleLogin('', '')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('invalid_credentials')
      expect(result.cookie).toBeUndefined()
    })
  })

  describe('環境変数が設定されていない場合（デフォルト値）', () => {
    beforeEach(() => {
      delete process.env.ADMIN_USERNAME
      delete process.env.ADMIN_PASSWORD
    })

    it('デフォルト認証情報でログインが成功する', async () => {
      const result = await handleLogin('neko', 'neko')
      
      expect(result.success).toBe(true)
      expect(result.cookie).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    it('間違った認証情報でログインが失敗する', async () => {
      const result = await handleLogin('admin', 'admin')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('invalid_credentials')
      expect(result.cookie).toBeUndefined()
    })
  })

  describe('セッションCookie', () => {
    beforeEach(() => {
      process.env.ADMIN_USERNAME = 'testuser'
      process.env.ADMIN_PASSWORD = 'testpass'
    })

    it('セッションCookieが正しく生成される', async () => {
      const result = await handleLogin('testuser', 'testpass')
      
      expect(result.success).toBe(true)
      expect(result.cookie).toContain('session=')
      expect(result.cookie).toContain('Path=/')
      expect(result.cookie).toContain('HttpOnly')
      expect(result.cookie).toContain('Secure')
      expect(result.cookie).toContain('SameSite=Strict')
    })

    it('セッションCookieに環境変数ハッシュが含まれる', async () => {
      const result = await handleLogin('testuser', 'testpass')
      
      expect(result.success).toBe(true)
      expect(result.cookie).toBeDefined()
      
      // Cookieからセッションデータを抽出
      const cookieMatch = result.cookie!.match(/session=([^;]+)/)
      expect(cookieMatch).toBeDefined()
      
      const sessionData = JSON.parse(atob(cookieMatch![1]))
      expect(sessionData.envHash).toBeDefined()
      expect(sessionData.envHash).toBe(btoa('testuser:testpass'))
    })
  })
})
