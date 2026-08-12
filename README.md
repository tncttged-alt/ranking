# キャラ格付けラボ サンプルプロジェクト

アニメ・漫画キャラクターランキング専門メディアの、依存関係なしで動く静的サイトです。

## 確認方法
`index.html` を直接開くと `fetch` が制限されるブラウザがあるため、ローカルサーバーを推奨します。

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開いてください。

## 記事追加
1. `data/articles.json` に記事情報を追加
2. `article.html` を複製し、title、meta description、canonical、OGP、構造化データ、本文を変更
3. 推奨URL例: `/ranking/{作品ローマ字}-strength-top30/`
4. 6順位ごとにページを分け、canonicalと前後ページ導線を正しく設定

## 公開前の必須差し替え
- `example.com` と `contact@example.com`
- 筆者名、経歴、監修実績
- プレースホルダ画像。権利者の許諾を得た画像のみ使用
- `#` のリンク、ASPの広告リンク、VOD・電子書籍リンク
- 運営者情報、プライバシーポリシー、免責事項
- コメント欄を本番APIまたは外部サービスへ接続し、スパム対策・投稿規約を追加
- Google Analytics 4、Search Console、広告計測タグ

## SEO・収益化メモ
- 各ページに固有のtitle、description、canonical、OGP、Article構造化データを実装済み
- H1は1つ、評価基準とランキングをH2、キャラクター名をH3にする設計
- 広告表記と `rel="sponsored nofollow"` の例を実装
- 広告過多で本文体験を損なわないよう、導入後・ランキング後・サイドバーを基本配置
- 分割ページの薄い内容や重複を避け、各キャラクターの根拠を十分に記載

## ファイル構成
- `index.html`: ホーム
- `article.html`: 記事テンプレート兼サンプル
- `data/articles.json`: 記事一覧データ
- `assets/styles.css`: レスポンシブデザイン
- `assets/app.js`: 検索・人気記事タブ
- `assets/article.js`: ランキング・コメントデモ
- `assets/images/`: 差し替え用サンプル画像
