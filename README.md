# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Environment Variables

Basic Auth認証を使用するために、以下の環境変数を設定してください：

```bash
# .env.local ファイルを作成
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
```

**注意**: 本番環境では必ず強力なパスワードに変更してください。

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Testing

このプロジェクトには包括的なテストスイートが含まれています。リグレッション（機能の退行）を防ぐために、変更を行う前にテストを実行することを推奨します。

### テストの実行

```bash
# すべてのテストを実行
npm run test:run

# テストをウォッチモードで実行
npm test

# テストUIを起動
npm run test:ui

# カバレッジレポート付きでテストを実行
npm run test:run -- --coverage
```

### テスト構成

- **環境変数設定テスト** (`tests/envConfig.test.ts`): 環境変数の読み込みとデフォルト値の動作をテスト
- **認証テスト** (`tests/auth.test.ts`): ログイン機能とセッションCookie生成をテスト
- **セッション管理テスト** (`tests/session.test.ts`): セッションCookie解析と環境変数変更検出をテスト
- **統合テスト** (`tests/integration.test.ts`): 認証フロー全体の動作をテスト

### テストカバレッジ

現在のテストカバレッジ：
- **ミドルウェア**: 80.39% (認証・セッション管理の核心機能)
- **ブランチカバレッジ**: 95.83% (条件分岐の大部分をカバー)
- **関数カバレッジ**: 72.72% (主要な関数をカバー)

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
