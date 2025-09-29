# AniShare Admin セットアップガイド

## 環境変数の設定

アプリケーションを実行する前に、以下の環境変数を設定する必要があります。

### 1. .envファイルの作成

プロジェクトルートに `.env` ファイルを作成し、以下の内容を追加してください：

```env
# データベース接続URL
DATABASE_URL="postgresql://username:password@localhost:5432/anishare_admin?schema=public"

# セッション秘密鍵
SESSION_SECRET="your-session-secret-key-here"

# 環境設定
NODE_ENV="development"
```

### 2. データベースの設定

#### PostgreSQLのインストール
```bash
# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows
# PostgreSQL公式サイトからインストーラーをダウンロード
```

#### データベースの作成
```bash
# PostgreSQLに接続
psql -U postgres

# データベースを作成
CREATE DATABASE anishare_admin;

# ユーザーを作成（オプション）
CREATE USER anishare_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE anishare_admin TO anishare_user;
```

### 3. Prismaマイグレーションの実行

```bash
# 依存関係のインストール
npm install

# Prismaクライアントの生成
npx prisma generate

# データベースマイグレーションの実行
npx prisma db push

# または、マイグレーションファイルを作成して実行
npx prisma migrate dev --name init
```

### 4. アプリケーションの起動

```bash
# 開発サーバーの起動
npm run dev
```

## トラブルシューティング

### よくあるエラー

1. **"No route matches URL"** エラー
   - ルーティング設定を確認してください
   - ブラウザのキャッシュをクリアしてください

2. **"Unexpected token '<'" エラー
   - データベース接続を確認してください
   - DATABASE_URLが正しく設定されているか確認してください

3. **Prisma接続エラー**
   - PostgreSQLが起動しているか確認してください
   - データベースが存在するか確認してください
   - 接続文字列が正しいか確認してください

### データベース接続の確認

```bash
# Prisma Studioでデータベースを確認
npx prisma studio

# データベース接続をテスト
npx prisma db pull
```

## 開発環境の推奨設定

- Node.js 18以上
- PostgreSQL 13以上
- npm または yarn



