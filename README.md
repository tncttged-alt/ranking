# ランキングデータベース VER1.3

アニメ・漫画キャラクターのランキング記事を、静的ファイルで管理するWebサイトです。

## ローカル起動

HTMLを直接開くとJSONの読み込みが制限されるため、ローカルサーバーを使います。

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開いてください。

## VER1.3の変更内容

- ホームに全体・月間・週間の人気記事ランキングを追加
- 人気順位は `data/articles.json` の期間別閲覧数で算出
- JavaScriptを改行・インデント付きの可読性が高い形式へ統一
- 記事一覧を `articles.json` から自動生成
- 新規ランキング作成ツール `tools/new_ranking.py` を追加
- 本番公開前チェックリストと記事追加手順をREADMEへ追加

## 記事追加手順

### 推奨方法

プロジェクトのルートで、次のコマンドを実行します。

```bash
python3 tools/new_ranking.py URLスラッグ "記事タイトル" "タイトルのひらがな読み"
```

例:

```bash
python3 tools/new_ranking.py sample-work "サンプル作品 強さランキングTOP30" "さんぷるさくひん"
```

このコマンドで以下が自動実行されます。

1. `rankings/_template/` を `rankings/sample-work/` へコピー
2. 分割HTML内の記事タイトルを置換
3. `data/articles.json` に記事情報を追加
4. 閲覧数を全体・月間・週間とも0で初期化

作成後、次を編集します。

1. `rankings/sample-work/ranking-data.json`
   - キャラクター名
   - 順位
   - 評価点
   - 評価文
2. `rankings/sample-work/page-*.html`
   - title
   - meta description
   - canonical URL
   - H1
   - 導入文
   - 評価基準
   - アフィリエイトリンク
3. `data/articles.json`
   - `description` を記事固有の説明へ変更

`articles.html` は `data/articles.json` を読み込み、`titleKana` の五十音順で自動表示します。手動で記事一覧HTMLを編集する必要はありません。

## 人気記事ランキングのデータ

`data/articles.json` の各記事に以下を設定します。

```json
"views": {
  "all": 50000,
  "month": 8000,
  "week": 2000
}
```

- `all`: 累計閲覧数
- `month`: 過去30日間の閲覧数
- `week`: 過去7日間の閲覧数

現在は静的なサンプル値です。本番ではアクセス解析APIやバックエンドの集計結果で更新してください。

## 本番運用前に必ず行うこと

### ドメイン・SEO

- `example.com` を本番ドメインへ変更
- 全ページのtitleとmeta descriptionを記事固有の内容へ変更
- canonical URLを正しいURLへ変更
- OGPのタイトル、説明、画像URLを変更
- XMLサイトマップを生成して公開
- `robots.txt` を設置
- Google Search Consoleまたは利用する検索管理サービスへ登録
- 構造化データを本番記事情報に合わせて検証
- 分割ページ同士の内部リンクとURLを確認

### 著作権・運営情報

- キャラクター画像は権利者の許諾を得たものだけ使用
- 引用する場合は引用要件と出典表記を確認
- 運営者情報ページを作成
- プライバシーポリシーを作成
- 免責事項を作成
- お問い合わせ先を実在する連絡先へ変更
- 広告・アフィリエイトを含むことを明示

### アフィリエイト

- `#` の広告リンクを正式なASPリンクへ差し替え
- 広告リンクに `rel="sponsored nofollow"` があるか確認
- PR表記が読者から見える位置にあるか確認
- ASPの規約に合わせて表現と画像を確認
- リンク切れを定期確認する仕組みを用意

### アクセス集計

- 現在の閲覧数はサンプル値のため、本番の集計処理へ置換
- Bot、管理者、短時間の重複閲覧を除外
- 全体・過去30日・過去7日の集計定義を固定
- 個人情報を扱う場合は同意取得とプライバシーポリシーへ反映

### コメント機能

- デモのローカル保存だけで運用しない
- 本番APIまたはコメントサービスへ接続
- XSS、CSRF、SQLインジェクション対策
- スパム対策、投稿頻度制限、通報、削除機能を用意
- コメントポリシーを公開

### 品質・セキュリティ

- スマートフォン実機で表示確認
- Chrome、Safari、Edgeで動作確認
- 404ページを作成
- HTTPSを有効化
- セキュリティヘッダーを設定
- APIキーやパスワードをGitへ登録しない
- 画像をWebPまたはAVIFへ最適化
- Lighthouseなどで速度、SEO、アクセシビリティを確認
- バックアップと復元手順を用意

## 主なファイル

```text
data/articles.json              記事登録と人気記事データ
assets/app.js                   ホームの人気記事・新着記事
assets/articles.js              五十音順の記事一覧
assets/menu.js                  左上メニュー
rankings/_template/             新規ランキングのひな型
rankings/sample-ranking/        サンプルランキング
tools/new_ranking.py            新規ランキング作成ツール
```
