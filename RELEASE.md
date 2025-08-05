# リリース手順

## GitHub ActionsでのNPMリリース自動化

### 事前準備

1. **NPMトークンの生成**
   - [npmjs.com](https://www.npmjs.com/) にログイン
   - Account Settings → Access Tokens → Generate New Token
   - Classic Token を選択し、「Automation」タイプを選択
   - トークンをコピー

2. **GitHubリポジトリにシークレットを設定**
   - リポジトリの Settings → Secrets and variables → Actions
   - 「New repository secret」をクリック
   - Name: `NPM_TOKEN`
   - Value: 先ほどコピーしたNPMトークン
   - 「Add secret」をクリック

### リリース方法

#### 方法1: 自動リリース（推奨） 🚀

**package.jsonのバージョンを変更すると自動的にNPMにリリースされます！**

1. **GitHub Actionsでバージョンバンプ**
   - リポジトリの Actions タブを開く
   - 左側の「Version Bump」をクリック
   - 「Run workflow」をクリック
   - バージョンタイプを選択（patch/minor/major）
   - 「Run workflow」をクリック

2. **自動的に以下が実行されます**
   - package.jsonのバージョンが更新される
   - 変更がmainブランチにコミット・プッシュされる
   - NPMへの公開が自動実行される
   - GitHubリリースとタグが自動作成される

#### 方法2: 手動でバージョン変更

1. ローカルでバージョンを更新
   ```bash
   npm version patch  # または minor, major
   ```

2. 変更をコミット・プッシュ
   ```bash
   git add package.json package-lock.json
   git commit -m "chore: bump version to x.x.x"
   git push origin main
   ```

3. **自動的にNPMへリリースされます！**

#### 方法3: 手動リリース（バージョン変更なし）

特定のバージョンを手動でリリースしたい場合：
- Actions → NPM Publish → Run workflow
- バージョンを入力して実行

### CI/CDワークフロー

- **test.yml**: PRやmainブランチへのプッシュ時に自動テスト実行
- **npm-publish.yml**: 手動トリガーまたはタグプッシュ時にNPMへ公開

### 注意事項

- リリース前に必ずテストが通ることを確認
- package.jsonのバージョンとタグ/入力バージョンが一致している必要があります
- NPMトークンは安全に管理し、定期的に更新することを推奨