# HmMarkdownSimpleRender の潜在的な問題点

このドキュメントは、`HmMarkdownSimpleRender` プロジェクトに存在する潜在的な問題点をまとめたものです。

---

## 1. セキュリティに関する重大な脆弱性

現在の実装には、複数のクロスサイトスクリプティング（XSS）脆弱性が存在する可能性があり、ユーザーが意図せず悪意のあるコードを実行してしまう危険性があります。

### a. `marked.js` のサニタイズ処理の無効化

`HmMarkdownSimpleRender.html` 内で、MarkdownをHTMLに変換するライブラリ `marked.js` が使用されていますが、その際に `sanitize: false` オプションが指定されています。

```javascript
marked.use({
    renderer,
    sanitize: false, // HTMLのサニタイズが無効化されている
    gfm: true
});
```

これは、Markdown内に含まれるHTMLタグ（例: `<script>`）を無害化しない設定です。もし悪意のある第三者が作成したMarkdownファイルを開くと、任意のJavaScriptコードが実行され、ローカルファイルへのアクセスや情報漏洩につながる可能性があります。

### b. `mermaid` の緩いセキュリティ設定

フローチャートなどを描画する `mermaid` ライブラリの初期化時に、`securityLevel: "loose"` が設定されています。

```javascript
mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });
```

Mermaidの公式ドキュメントによると、この設定は `<script>` タグの実行を許可するため、これもXSSの攻撃経路となり得ます。

### c. `innerHTML` への直接的な書き込み

エディタから受け取ったテキストや、ライブラリで変換した後のHTMLを、`innerHTML` プロパティを使って直接DOMに書き込んでいます。これは、適切なサニタイズ処理が行われていない場合、XSSを引き起こす典型的な原因となります。

```javascript
// 例: onReceiveObject 関数内
tempDiv.innerHTML = obj.text;
content.innerHTML = marked.parse(tempDiv.innerHTML);
```

### d. Base HREF インジェクションの可能性

プレビュー内の相対パスを解決するため、URLのクエリパラメータ `base` の値を元に `<base>` タグを生成しています。この `baseValue` が無害化されていないため、細工されたURLを介して外部の不正なサーバーにリソースを向けることが可能になるかもしれません。

## 2. 依存関係に関する問題

本ツールは外部のCDN（コンテンツデリバリネットワーク）でホストされているライブラリに完全に依存しており、いくつかのリスクを抱えています。

### a. 外部CDNへの依存

以下のライブラリはすべてCDN経由で読み込まれています。
- `HmCustomRenderBrowser.min.js`
- `github-markdown.min.css`
- `marked.min.js`
- `mermaid.min.js`
- `mathjax.js`

これにより、以下の問題が発生します。
- **オフライン環境で動作しない**: インターネット接続がなければ、プレビュー機能は一切利用できません。
- **CDNの障害・サービス終了リスク**: CDNサーバーがダウンしたり、ライブラリの配信が停止されたりすると、ツールが機能しなくなります。

### b. ライブラリのバージョンが古い

`HmMarkdownSimpleRender.html` で指定されているライブラリのバージョンは、必ずしも最新ではありません。
- `marked`: `15.0.12`
- `mermaid`: `11.7.0`
- `mathjax`: `3.2.2`

古いバージョンのライブラリを使い続けることには、以下のようなリスクがあります。
- **既知の脆弱性**: ライブラリに後から発見された脆弱性が修正されていない可能性があります。
- **機能不足・バグ**: 新しいMarkdownの記法に対応していなかったり、既知のバグが放置されたままだったりする可能性があります。

## 3. コード品質と保守性に関する問題

### a. 複雑で壊れやすいレンダリング処理

`onReceiveObject` 関数内でのレンダリング処理は、非常に複雑な手順を踏んでいます。
1. 受け取ったテキストを `innerHTML` で一時的な `div` に挿入する。
2. その `div` に対して `MathJax` を実行する。
3. `MathJax` 処理後の `innerHTML` を `marked.js` で解析する。
4. 最終結果をコンテンツ用の `div` に挿入する。
5. `mermaid` を実行する。

この方法は処理の順序に強く依存しており、予期しない動作や、前述のセキュリティ脆弱性を引き起こす原因となっています。よりシンプルで安全な、標準的なレンダリング手法（MarkdownをHTMLに変換 → DOMに挿入 → MathJaxやMermaidを実行）に修正することが望まれます。

### b. 秀丸マクロ側の可読性

`HmCustomRenderServer.WebView2.js` には `// ここはパッチだと思って!!` といったコメントが見られ、場当たり的な修正が行われていることが示唆されます。将来のメンテナンス性を考慮すると、このようなコードはリファクタリングすることが望ましいです。
