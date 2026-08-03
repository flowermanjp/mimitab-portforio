---
name: blog-post
description: mimitab-portforio のブログ記事（/blog 配下）を新規作成・編集するときの手順。「ブログ書きたい」「記事追加して」「/blog に〜の記事を」「下書きを記事にして」など、このポートフォリオの記事に関わる作業で必ず使う。記事は1本 = 1つの .astro ページで、メタデータのレジストリとの2ファイル管理になっているので、この手順を踏まないと CI が落ちる。
---

# ブログ記事を書く

このリポジトリの記事は **1本 = 1つの `.astro` ページ**。Markdown でも MDX でもない。
理由と設計は `decisions/0001-blog-as-astro-pages.md` にある（記事ごとに独自の SVG・
CSS アニメーション・スクリプトを自由に書けることが最優先の要件）。

そのぶん、記事1本につき **2ファイル** を触る必要がある。片方を忘れると `npm run test` が落ちる。

## 手順

### 1. 記事の骨子を決める

ユーザーが題材だけを渡してきた場合、書き始める前に次を確定させる。曖昧なら聞く。

- `id` … そのまま `/blog/{id}` になる。英小文字・数字・ハイフンのみ（例: `playwright-flaky`）
- `title` … 日本語。一覧とタブに出る
- `description` … 1〜2文。一覧カードと `<meta name="description">` に使われる
- `publishedAt` … **今日の日付を推測しない。`date +%F` で取る**
- `categories` … 1つ以上。`src/data/blog.ts` の `categories` にある id から選ぶ

現在のカテゴリ: `qa` (QA) / `dev` (開発) / `astro` (Astro) / `misc` (雑記)

どれにも当てはまらないときだけ `src/data/blog.ts` の `categories` 配列に足す。
足せば一覧のチップも `/blog/category/{id}` も自動で増えるので、他に触る場所は無い。

### 2. `src/data/blog.ts` の `posts` に追加する

**配列の先頭**に入れる（新しい順に並べる規約）。

```ts
{
  id: 'playwright-flaky',
  title: '落ちるE2Eを落ちなくする',
  description: '...',
  publishedAt: '2026-08-10',
  categories: ['qa', 'dev'],
  // updatedAt: '2026-08-12',  // 後から大きく直したとき
  // draft: true,              // 書きかけ。一覧にもカテゴリページにも出ない
}
```

`draft: true` でも**ページファイルは必要**（構造テストが1対1を要求する）。
一覧に出したくないだけならこれでいい。

### 3. `src/pages/blog/{id}.astro` を作る

```astro
---
import BlogArticle from '../../layouts/BlogArticle.astro'
import Callout from '../../components/blog/Callout.astro'
import { getPost } from '../../data/blog'

const post = getPost('playwright-flaky')   // ← 2 で足した id と一致させる
---

<BlogArticle post={post}>
  <p>本文。</p>
  <h2>見出し</h2>
  <p>ここは普通の .astro なので、この記事だけの SVG も &lt;style&gt; も &lt;script&gt; も書ける。</p>
</BlogArticle>
```

`BlogArticle` が日付・タイトル・カテゴリチップ・読み進み度バー・前後リンク・
`/blog` への導線をすべて出す。記事側では本文だけを書く。

長いコード片は frontmatter で `const sample = \`...\`` として定義し、`<CodeBlock code={sample} />` に渡す。

### 4. 検証する

```sh
npm run test        # レジストリ↔ページの対応、日付形式、カテゴリの妥当性
npm run typecheck
npm run build
```

`npm run dev` で `/blog`（一覧に出るか・絞り込みで引っかかるか）と `/blog/{id}` を見る。

## 記事内で使えるコンポーネント

すべて `src/components/blog/`。外部ライブラリは使わない方針なので、
チャートライブラリや Mermaid を追加しないこと。

| コンポーネント | Props |
|---|---|
| `Callout` | `type?: 'note' \| 'tip' \| 'warn'`（既定 `note`）, `title?`, slot |
| `Figure` | `caption?`, `framed?`（既定 `true`。手書き SVG を素で置くなら `false`）, slot |
| `BarChart` | `data: { label, value, highlight?, note? }[]`, `caption?`, `unit?`, `max?` |
| `StepFlow` | `steps: { title, body, highlight? }[]`, `caption?` |
| `CodeBlock` | `code: string`, `lang?`（既定 `'ts'`）, `filename?` |

`highlight: true` を付けた項目だけがアクセントカラー (`#367D80`) になる。全部に付けない。

実例は `src/pages/blog/hello-blog.astro` に一通り入っている。迷ったらそこを見る。

決まった形に収まらない図は `<Figure>` に SVG を直接書く。それがこのブログの存在理由なので、
既製コンポーネントで妥協するくらいなら手書きの図を作ってよい。

## 書くときの制約

**デザイン**

- 色・フォントを新しく増やさない。`src/styles/global.css` の CSS 変数
  （`--accent` `--warm` `--taupe` `--text-mid` `--text-muted` `--border` …）を使う
- 極細フォント・広いレタースペーシングという既存のトーンに合わせる
  （`text-[11px] font-light tracking-[0.2em]` 系）

**アニメーション**

- スクロールで出したい要素には `class="reveal"` を付けるだけでいい。
  監視は `Layout.astro` の IntersectionObserver が既にやっている。新しい observer を書かない
- 記事固有のアニメーションを書いたら、必ず `@media (prefers-reduced-motion: reduce)` で
  止める分岐を書く（既存のコンポーネントは全部そうなっている）

**CSS の落とし穴**

- `src/styles/blog.css` は Tailwind のレイヤー外なので、**Tailwind のユーティリティより強い**。
  `.chart-bar` `.step-line` `.reading-progress` は blog.css 側で `transform` を持っているので、
  これらの要素に `-translate-x-1/2` などの transform 系ユーティリティを足しても効かない
- 本文は `.prose-mimi` で囲まれていて `h2 h3 p ul ol a blockquote table code` に
  スタイルが当たる。コンポーネント内部でリスト風の見た目を作るときは
  `ul`/`ol` ではなく `div` を使う（`StepFlow` がそうしている）

**文章のトーン**

`src/data/profile.ts` の bio と既存記事に合わせる。です・ます調で、
断定しすぎず、実際にやったこと・体感したことベースで書く。

## やらないこと

- `src/pages/blog/index.astro` と `src/pages/blog/category/[category].astro` は
  `src/data/blog.ts` だけを読むように作られている。記事を足すときにここを編集する必要は無いし、
  **一覧側から記事コンポーネントを import してはいけない**（記事の `<script>` が
  一覧ページのバンドルに入ってしまう。ADR 0001 参照）
- `id` に `category` / `index` は使えない（`RESERVED_IDS`）
