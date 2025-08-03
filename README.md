# branch2ports

ブランチ名とディレクトリ名を基に動的にポート番号を生成するCLIツール

## 概要

`branch2ports`は、git worktreeや複数ブランチでの並行開発時に、ポート番号の競合を避けるためのツールです。ディレクトリ名とブランチ名をハッシュ化してオフセット値を計算し、ベースポートに加算することで一意なポート番号を生成します。

## 使用方法

### 初回セットアップ

```bash
# 対話的に設定ファイルを作成
npx branch2ports init
```

### ポート番号生成

```bash
# 基本的な使用方法
npx branch2ports

# または明示的にgenerateコマンドを指定
npx branch2ports generate

# カスタム設定ファイルを指定
npx branch2ports --config .my-config

# 出力ファイルを指定
npx branch2ports --output .env.local
```

## 設定ファイル

プロジェクトルートに `.branch2ports` ファイルを作成して設定を行います。サンプルとして `.branch2ports.example` を参考にしてください。

```json
{
  "basePort": {
    "frontend": 3000,
    "backend": 5000,
    "database": 5432
  },
  "outputFile": ".env",
  "offsetRange": 1000
}
```

### 設定項目

- `basePort`: サービスごとのベースポート番号を定義
- `outputFile`: 生成されるポート番号を出力するファイル名（デフォルト: `.env`）
- `offsetRange`: オフセット値の範囲（デフォルト: 1000）

## 動作原理

1. Gitリポジトリの識別子（リモートURL→リポジトリルートパス→現在のディレクトリの順で取得）とブランチ名を取得
2. リポジトリ識別子 + ブランチ名の文字列をハッシュ化
3. ハッシュ値を`offsetRange`で割った余りをオフセット値として計算
4. ベースポート + オフセット値で最終的なポート番号を決定
5. 指定された出力ファイルに環境変数として書き出し

**一意性の保証**: 同じリポジトリの同じブランチなら常に同じポート番号、異なるリポジトリや異なるブランチなら異なるポート番号が生成されます。

## 出力例

```bash
# .env ファイルの出力例
FRONTEND_PORT=3247
BACKEND_PORT=5247
DATABASE_PORT=5679
```

## 使用ケース

- git worktreeを使った複数環境での並行開発
- 複数ブランチでのローカル開発環境構築
- Docker Composeでのポート番号管理
- 開発チーム内でのポート競合回避

## 技術仕様

- **言語**: TypeScript
- **実行環境**: Node.js
- **依存関係**: 最小限（commander.js等のCLIライブラリ）
- **配布方法**: npm パッケージ（npx実行可能）

## 開発・貢献

```bash
# 開発環境のセットアップ
npm install
npm run build

# テスト実行
npm test

# パッケージのビルド
npm run build
```