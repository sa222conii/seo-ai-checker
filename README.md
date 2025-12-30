# AI-Powered SEO Checker

AIを活用したブログ記事のSEO分析ツール。企業のSEO担当者向けに、記事のタイトル、見出し、本文を分析し、100点満点でスコアリングします。

![SEO Checker Demo](https://img.shields.io/badge/Score-85%2F100-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ 主な機能

- **🤖 AI分析**: OpenAI GPT-4o-miniによる高精度なSEO分析
- **📊 スコアリング**: 100点満点でのビジュアライズ（円形プログレスバー）
- **💡 改善提案**: 具体的なSEO改善アドバイス
- **🛡️ Rate Limiting**: Vercel KVによる1日5回/IPの制限（API破産対策）
- **📋 コピー機能**: 分析結果をワンクリックでクリップボードにコピー
- **🎨 プレミアムUI**: ダークテーマ with グラデーション

## 🚀 技術スタック

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI API (GPT-4o-mini)
- **Rate Limiting**: Vercel KV (Redis)
- **Deployment**: Vercel

## 📦 ローカル開発

### 1. リポジトリのクローン

\`\`\`bash
git clone https://github.com/yourusername/seo-ai-checker.git
cd seo-ai-checker
\`\`\`

### 2. 依存関係のインストール

\`\`\`bash
npm install
\`\`\`

### 3. 環境変数の設定

\`.env.local\`ファイルを作成し、以下を設定：

\`\`\`env
OPENAI_API_KEY=your_openai_api_key_here
\`\`\`

### 4. 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

http://localhost:3000 でアプリが起動します。

## 🌐 Vercelへのデプロイ

### 1. Vercel KVの設定

Vercelダッシュボードで：
1. プロジェクトを選択
2. **Storage** → **Create Database** → **KV**
3. 自動的に環境変数が設定されます

### 2. OpenAI APIキーの設定

Vercelプロジェクトの **Settings** → **Environment Variables** で：
- `OPENAI_API_KEY`: あなたのOpenAI APIキー

### 3. デプロイ

\`\`\`bash
git commit -am "Initial commit"
git push
\`\`\`

Vercelが自動的にデプロイします。

## 🔧 工夫した点（ポートフォリオアピール用）

### 1. セキュリティ & コスト対策
- **APIキー漏洩防止**: Serverless Functions経由でAPIを呼び出し、クライアント側にキーを露出しない
- **Rate Limiting**: Vercel KVを使用したIPベースの制限により、バズった際のAPI破産を防止
- **ローカルフォールバック**: 開発環境ではin-memoryストアにフォールバック

### 2. UX Design
- **円形プログレスバー**: スコアの視覚化で直感的な理解を促進
- **段階的評価**: 80点以上「優秀」、60点以上「良好」、それ以下「要改善」で色分け
- **コピー機能**: 分析結果を即座にレポートとして利用可能

### 3. AI Prompt Engineering
- 企業のSEO担当者向けに特化したプロンプト設計
- JSON形式での構造化レスポンスで確実なパース
- タイトル文字数、キーワード位置、見出し階層など6つの評価基準を明示

## 📊 評価基準

AI分析は以下の基準で評価します：

1. **タイトルの文字数** (30-35文字が理想)
2. **タイトルのキーワード位置** (前半が効果的)
3. **見出しの階層構造** (H1→H2→H3の適切性)
4. **見出しのキーワード含有**
5. **本文の読みやすさ**
6. **キーワードの自然な使用**

## 📝 ライセンス

MIT License

## 🙏 使用技術の謝辞

- [Next.js](https://nextjs.org/)
- [OpenAI API](https://openai.com/)
- [Vercel](https://vercel.com/)
- [Tailwind CSS](https://tailwindcss.com/)
