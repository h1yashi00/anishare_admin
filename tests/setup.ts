// テスト環境のセットアップ
import { beforeAll, afterAll } from 'vitest'

// テスト用の環境変数を設定
beforeAll(() => {
  // テスト用の環境変数を設定
  process.env.ADMIN_USERNAME = 'testuser'
  process.env.ADMIN_PASSWORD = 'testpass'
})

afterAll(() => {
  // テスト後のクリーンアップ
  delete process.env.ADMIN_USERNAME
  delete process.env.ADMIN_PASSWORD
})
