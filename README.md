# HmMarkdownSimpleRender

![HmMarkdownSimpleRender latest release](https://img.shields.io/github/v/release/komiyamma/hm_markdown_simple_render)
[![CC0](https://img.shields.io/badge/license-CC0-blue.svg?style=flat)](LICENSE.txt)

秀丸エディタ上で **Markdown / Mermaid / MathJax** に対応したリアルタイムプレビューを表示するマクロです。
主に、ChatGPTのような対話AIの返答や、GitHubのMarkdownファイルなどを、秀丸エディタに貼り付けて素早くプレビューするために作成されました。

<img src="./cnt_hm_markdown_simple_render_01.png">

## 特徴

*   **リアルタイムプレビュー**: 編集中のMarkdownがリアルタイムでプレビューに反映されます（約2秒ごとに更新）。
*   **多彩な表現力**:
    *   **Markdown**: 一般的なMarkdown記法をサポートしています ([marked.js](https://github.com/markedjs/marked) を使用)。
    *   **Mermaid**: ` ```mermaid ` で囲むことで、フローチャートやシーケンス図などの作図が可能です ([Mermaid](https://mermaid.js.org/) を使用)。
    *   **MathJax**: `$...$` や `$$...$$` で囲むことで、LaTeX形式の数式をきれいに表示できます ([MathJax](https://www.mathjax.org/) を使用)。
*   **GitHubスタイル**: プレビューは使い慣れたGitHub風のCSSで表示されます。
*   **ローカル画像対応**: プレビューしたいMarkdownファイルが保存されていれば、そこを基準とした相対パスでの画像表示に対応しています。
*   **簡単導入**: 外部ライブラリのインストールは不要です。マクロを配置するだけで動作します（ライブラリはCDN経由で読み込まれます）。

## 動作環境

*   秀丸エディタ Ver 9.43.99 以降 (WebView2 対応版)
*   WebView2 ランタイム (通常はWindows 11や最新のWindows 10にはプリインストールされています)

## インストール

1.  本リポジトリから以下のファイルをダウンロードします。
    *   `HmMarkdownSimpleRender.mac`
    *   `HmMarkdownSimpleRender.html`
    *   `HmCustomRenderServer.WebView2.js`
2.  ダウンロードした3つのファイルを、秀丸エディタのマクロ用フォルダ（`C:\Users\YourName\AppData\Roaming\Hidemaruo\Hidemaru\Macro` など）に配置します。

## 使い方

1.  秀丸エディタでMarkdown形式のファイルを開くか、テキストを貼り付けます。
2.  マクロメニューから `HmMarkdownSimpleRender.mac` を実行します。
3.  エディタの右側にプレビュー用のペインが表示されます。
4.  テキストを編集すると、自動でプレビューが更新されます。

## 技術的な仕組み

このマクロは、秀丸エディタのWebView2機能を活用して、以下の流れで動作しています。

1.  **`HmMarkdownSimpleRender.mac`**: マクロの起点。WebView2の準備とサーバー役のJavaScript(`HmCustomRenderServer.WebView2.js`)の読み込みを行います。
2.  **`HmCustomRenderServer.WebView2.js`**: 秀丸エディタ内でローカルHTTPサーバーを起動します。このサーバーは、エディタ内のテキストをリクエストに応じて提供する役割を持ちます。
3.  **`HmMarkdownSimpleRender.html`**: WebView2ペインに表示されるWebページ。定期的にローカルHTTPサーバーに問い合わせてエディタの最新テキストを取得し、`marked.js`, `Mermaid`, `MathJax` を使ってHTMLに変換・描画します。

## ライセンス

このプロジェクトは [CC0 (Creative Commons Zero)](LICENSE.txt) の下に公開されています。ご自由にお使いください。

## 注意事項

*   各JavaScriptライブラリをCDN経由で読み込むため、初回利用時やキャッシュが切れた後は、インターネット接続が必要です。
*   プレビューの更新は2秒間隔です。キー入力ごとのリアルタイム更新ではありません。
*   非常に長い、あるいは複雑なドキュメントの場合、描画に少し時間がかかる可能性があります。