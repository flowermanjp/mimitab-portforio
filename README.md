# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
| `npm run typecheck`       | `astro check` で型と Astro の診断を見る          |
| `npm run test`            | vitest（ブログのデータ層 + 構造チェック）        |

## ✍️ ブログ記事の書き方

記事は **1本 = 1つの `.astro` ページ**。理由と設計は
[`decisions/0001-blog-as-astro-pages.md`](./decisions/0001-blog-as-astro-pages.md) にある。

書くときに触るファイルは2つ。

1. **`src/data/blog.ts`** の `posts` に1件足す（`id` はそのまま `/blog/{id}` になる）
2. **`src/pages/blog/{id}.astro`** を作る

```astro
---
import BlogArticle from '../../layouts/BlogArticle.astro'
import { getPost } from '../../data/blog'

const post = getPost('my-post')   // ← 1 で足した id
---

<BlogArticle post={post}>
  <p>本文。ここは普通の .astro なので、独自の SVG も &lt;style&gt; も &lt;script&gt; も書ける。</p>
</BlogArticle>
```

- 一覧 `/blog` とカテゴリページ `/blog/category/{id}` は `src/data/blog.ts` だけを見ているので、
  記事側では何もしなくていい
- 図表コンポーネントは `src/components/blog/`（`Callout` / `Figure` / `BarChart` / `StepFlow` / `CodeBlock`）。
  実例は `src/pages/blog/hello-blog.astro` にひととおり入っている
- スクロールで演出したい要素には `class="reveal"` を付ける（監視は `Layout.astro` 側でやっている）
- 1 と 2 のどちらかを忘れると `npm run test` が落ちる

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
