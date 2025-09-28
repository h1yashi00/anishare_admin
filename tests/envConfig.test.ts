import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { envConfig } from '../app/middleware.server'

describe('envConfig', () => {
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

  describe('adminUsername', () => {
    it('環境変数が設定されている場合はその値を返す', () => {
      process.env.ADMIN_USERNAME = 'customuser'
      expect(envConfig.adminUsername).toBe('customuser')
    })

    it('環境変数が設定されていない場合はデフォルト値を返す', () => {
      delete process.env.ADMIN_USERNAME
      expect(envConfig.adminUsername).toBe('neko')
    })
  })

  describe('adminPassword', () => {
    it('環境変数が設定されている場合はその値を返す', () => {
      process.env.ADMIN_PASSWORD = 'custompass'
      expect(envConfig.adminPassword).toBe('custompass')
    })

    it('環境変数が設定されていない場合はデフォルト値を返す', () => {
      delete process.env.ADMIN_PASSWORD
      expect(envConfig.adminPassword).toBe('neko')
    })
  })

  describe('credentials', () => {
    it('環境変数が設定されている場合はその値を返す', () => {
      process.env.ADMIN_USERNAME = 'testuser'
      process.env.ADMIN_PASSWORD = 'testpass'
      
      const credentials = envConfig.credentials
      expect(credentials.username).toBe('testuser')
      expect(credentials.password).toBe('testpass')
    })

    it('環境変数が設定されていない場合はデフォルト値を返す', () => {
      delete process.env.ADMIN_USERNAME
      delete process.env.ADMIN_PASSWORD
      
      const credentials = envConfig.credentials
      expect(credentials.username).toBe('neko')
      expect(credentials.password).toBe('neko')
    })
  })

  describe('envHash', () => {
    it('環境変数が設定されている場合は正しいハッシュを生成する', () => {
      process.env.ADMIN_USERNAME = 'testuser'
      process.env.ADMIN_PASSWORD = 'testpass'
      
      const hash = envConfig.envHash
      const expectedHash = btoa('testuser:testpass')
      expect(hash).toBe(expectedHash)
    })

    it('環境変数が設定されていない場合はデフォルト値のハッシュを生成する', () => {
      delete process.env.ADMIN_USERNAME
      delete process.env.ADMIN_PASSWORD
      
      const hash = envConfig.envHash
      const expectedHash = btoa('neko:neko')
      expect(hash).toBe(expectedHash)
    })

    it('環境変数が変更されるとハッシュも変更される', () => {
      process.env.ADMIN_USERNAME = 'user1'
      process.env.ADMIN_PASSWORD = 'pass1'
      const hash1 = envConfig.envHash

      process.env.ADMIN_USERNAME = 'user2'
      process.env.ADMIN_PASSWORD = 'pass2'
      const hash2 = envConfig.envHash

      expect(hash1).not.toBe(hash2)
    })
  })
})
