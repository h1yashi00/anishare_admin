import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { handleLogin, createSessionCookie, parseSessionCookie, envConfig } from '../app/middleware.server'

describe('Integration Tests', () => {
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

  describe('完全な認証フロー', () => {
    beforeEach(() => {
      process.env.ADMIN_USERNAME = 'testuser'
      process.env.ADMIN_PASSWORD = 'testpass'
    })

    it('ログインからセッション作成、検証まで正常に動作する', async () => {
      // 1. ログイン
      const loginResult = await handleLogin('testuser', 'testpass')
      expect(loginResult.success).toBe(true)
      expect(loginResult.cookie).toBeDefined()

      // 2. セッションCookieを抽出
      const cookieMatch = loginResult.cookie!.match(/session=([^;]+)/)
      expect(cookieMatch).toBeDefined()
      
      const cookieHeader = `session=${cookieMatch![1]}`

      // 3. セッション検証
      const user = parseSessionCookie(cookieHeader)
      expect(user).not.toBeNull()
      expect(user!.name).toBe('testuser')
      expect(user!.email).toBe('testuser@admin.local')
    })

    it('環境変数変更時にセッションが無効化される', async () => {
      // 1. 最初の環境変数でログイン
      const loginResult1 = await handleLogin('testuser', 'testpass')
      expect(loginResult1.success).toBe(true)

      const cookieMatch1 = loginResult1.cookie!.match(/session=([^;]+)/)
      const cookieHeader1 = `session=${cookieMatch1![1]}`

      // 2. セッションが有効であることを確認
      const user1 = parseSessionCookie(cookieHeader1)
      expect(user1).not.toBeNull()

      // 3. 環境変数を変更
      process.env.ADMIN_USERNAME = 'newuser'
      process.env.ADMIN_PASSWORD = 'newpass'

      // 4. 古いセッションが無効化されることを確認
      const user2 = parseSessionCookie(cookieHeader1)
      expect(user2).toBeNull()

      // 5. 新しい環境変数でログイン
      const loginResult2 = await handleLogin('newuser', 'newpass')
      expect(loginResult2.success).toBe(true)

      const cookieMatch2 = loginResult2.cookie!.match(/session=([^;]+)/)
      const cookieHeader2 = `session=${cookieMatch2![1]}`

      // 6. 新しいセッションが有効であることを確認
      const user3 = parseSessionCookie(cookieHeader2)
      expect(user3).not.toBeNull()
      expect(user3!.name).toBe('newuser')
    })
  })

  describe('環境変数設定の一貫性', () => {
    it('envConfigとhandleLoginで同じ環境変数を使用する', async () => {
      process.env.ADMIN_USERNAME = 'configuser'
      process.env.ADMIN_PASSWORD = 'configpass'

      // envConfigから認証情報を取得
      const { username, password } = envConfig.credentials
      expect(username).toBe('configuser')
      expect(password).toBe('configpass')

      // handleLoginで同じ認証情報を使用
      const result = await handleLogin(username, password)
      expect(result.success).toBe(true)
    })

    it('envConfigとセッション管理で同じ環境変数ハッシュを使用する', async () => {
      process.env.ADMIN_USERNAME = 'hashuser'
      process.env.ADMIN_PASSWORD = 'hashpass'

      // envConfigからハッシュを取得
      const configHash = envConfig.envHash
      expect(configHash).toBe(btoa('hashuser:hashpass'))

      // ログインしてセッションを作成
      const loginResult = await handleLogin('hashuser', 'hashpass')
      expect(loginResult.success).toBe(true)

      // セッションCookieからハッシュを取得
      const cookieMatch = loginResult.cookie!.match(/session=([^;]+)/)
      const sessionData = JSON.parse(atob(cookieMatch![1]))
      
      // 同じハッシュが使用されていることを確認
      expect(sessionData.envHash).toBe(configHash)
    })
  })

  describe('エラーハンドリング', () => {
    beforeEach(() => {
      process.env.ADMIN_USERNAME = 'testuser'
      process.env.ADMIN_PASSWORD = 'testpass'
    })

    it('無効な認証情報でログインが失敗する', async () => {
      const result = await handleLogin('invalid', 'invalid')
      expect(result.success).toBe(false)
      expect(result.error).toBe('invalid_credentials')
      expect(result.cookie).toBeUndefined()
    })

    it('無効なセッションCookieでnullが返される', () => {
      const result = parseSessionCookie('invalid-cookie')
      expect(result).toBeNull()
    })

    it('期限切れセッションでnullが返される', () => {
      const expiredSessionData = {
        userId: '1',
        username: 'testuser',
        email: 'test@example.com',
        loginTime: Date.now() - (25 * 60 * 60 * 1000), // 25時間前
        envHash: btoa('testuser:testpass')
      }

      const expiredCookie = `session=${btoa(JSON.stringify(expiredSessionData))}`
      const result = parseSessionCookie(expiredCookie)
      expect(result).toBeNull()
    })
  })
})
