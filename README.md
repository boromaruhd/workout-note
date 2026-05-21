# 🏋️ トレーニングノート - PWA化セットアップ手順

このフォルダの中身を使って、自分専用のトレーニングノートアプリをスマホに入れます。

## 📋 全体の流れ

1. GitHubにアカウント作成・このフォルダをアップロード（15分）
2. Vercelで公開（10分）
3. スマホでホーム画面に追加（1分）

---

## ステップ1: GitHubにコードを置く

### 1-1. GitHubアカウントを作る
1. https://github.com/signup にアクセス
2. メールアドレスとパスワードを入れてアカウント作成
3. プラン選択は **Free** でOK

### 1-2. 新しいリポジトリ（保管庫）を作る
1. ログイン後、画面右上の「+」→「New repository」をクリック
2. **Repository name** に `workout-note` と入力
3. **Public** を選んだまま（Privateだと無料Vercelに繋げにくい）
4. 一番下の **Create repository** ボタンを押す

### 1-3. このフォルダの中身をアップロード
1. 作ったリポジトリのページで「uploading an existing file」をクリック
   （もし見つからなければ「Add file」→「Upload files」）
2. このZIPを解凍したフォルダの中身を**すべて**ドラッグ&ドロップ
   - `package.json`、`vite.config.js`、`index.html`、`src/`、`public/` などが入っているはず
   - `node_modules` フォルダがあれば**アップロードしないで**ください（不要・重い）
3. 一番下の **Commit changes** ボタンを押す

---

## ステップ2: Vercelで公開する

### 2-1. Vercelに登録
1. https://vercel.com/signup にアクセス
2. **Continue with GitHub** をクリック
3. GitHubアカウントで連携

### 2-2. プロジェクトを作る
1. ダッシュボードで **Add New** → **Project** をクリック
2. 先ほど作った `workout-note` リポジトリを選んで **Import**
3. 設定はそのままで **Deploy** ボタンを押す
4. 1〜2分待つと公開完了！

### 2-3. URLを確認
- Vercelの画面に `workout-note-xxxxx.vercel.app` のようなURLが出ます
- そのURLをタップすると、自分のトレーニングノートが開きます

---

## ステップ3: スマホのホーム画面に追加

### iPhone (Safari) の場合
1. SafariでVercelのURLを開く
2. 画面下の **共有ボタン**（□と↑のマーク）をタップ
3. **ホーム画面に追加** を選ぶ
4. 名前を確認して **追加** をタップ

### Android (Chrome) の場合
1. ChromeでVercelのURLを開く
2. 画面右上の **︙** メニューをタップ
3. **ホーム画面に追加** を選ぶ
4. **追加** をタップ

---

## ✅ 完了！

ホーム画面のアイコンをタップすると、ブラウザのバーが消えて**アプリそっくり**に開きます。
データはスマホに保存されるので、オフラインでも記録できます。

---

## 🆘 困ったときは

- アップロードがうまくいかない → Claudeに「GitHubのアップロードでエラーが出た」と相談
- Vercelでビルドエラー → エラー画面のスクショをClaudeに見せる
- アイコンを変えたい → Claudeに「アイコンをこういう感じに」と頼む

---

## 📁 フォルダの中身

```
workout-pwa/
├── package.json        ← どのライブラリを使うかの設定
├── vite.config.js      ← PWA化の設定
├── index.html          ← アプリの入口
├── public/
│   ├── icon-192.png    ← アプリアイコン (小)
│   ├── icon-512.png    ← アプリアイコン (大)
│   └── favicon.svg     ← ブラウザタブのアイコン
└── src/
    ├── main.jsx        ← Reactの起動コード
    └── WorkoutNote.jsx ← アプリ本体のコード
```
