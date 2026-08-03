// ── ブログ ────────────────────────────────────────────
// 記事の実体は src/pages/blog/{id}.astro に1本ずつ手書きで置く。
// このファイルはメタデータの唯一の情報源（レジストリ）。
// 一覧・カテゴリページはこのファイルだけを読む（記事コンポーネントは import しない）。
// レジストリとページファイルのズレは src/data/blog.structure.test.ts が検出する。

// ── カテゴリ ──────────────────────────────────────────
export const categories = [
  { id: 'qa', label: 'QA' },
  { id: 'dev', label: '開発' },
  { id: 'astro', label: 'Astro' },
  { id: 'misc', label: '雑記' },
] as const

export type CategoryId = (typeof categories)[number]['id']

export type Post = {
  /** = /blog/{id}。src/pages/blog/{id}.astro のファイル名と一致させる */
  id: string
  title: string
  /** 一覧カードと <meta name="description"> に使う */
  description: string
  /** 'YYYY-MM-DD' */
  publishedAt: string
  updatedAt?: string
  categories: CategoryId[]
  draft?: boolean
}

/** ルーティング上すでに使っているので記事 id には使えない */
export const RESERVED_IDS = ['category', 'index'] as const

// ── 記事レジストリ（新しい順に足していく）────────────────
export const posts: Post[] = [
  {
    id: 'blog-structure-and-skill',
    title: 'このブログの構成と、AIへの指示書',
    description:
      '記事1本 = 1つの .astro ページという構成を、依存の向きから見直す。そのぶん増えた手順とハマりどころを AI 向けの指示書に落として、CI で守っている話。',
    publishedAt: '2026-08-03',
    categories: ['astro', 'dev'],
  },
  {
    id: 'hello-blog',
    title: 'このブログの作り方',
    description:
      '自前でソースを持っているからできる表現を試す場所として、ポートフォリオに /blog を作った。仕組みと、記事の中で使える図表コンポーネントの紹介。',
    publishedAt: '2026-08-03',
    categories: ['astro', 'dev'],
  },
]

// ── ヘルパー（純関数。すべて blog.test.ts でテストする）──

const categoryIds = new Set<string>(categories.map((c) => c.id))

export function isCategoryId(value: string): value is CategoryId {
  return categoryIds.has(value)
}

export function categoryLabel(id: CategoryId): string {
  const found = categories.find((c) => c.id === id)
  if (!found) throw new Error(`未知のカテゴリです: ${id}`)
  return found.label
}

/** draft を除き、publishedAt の新しい順に並べた記事一覧 */
export function publishedPosts(): Post[] {
  return posts
    .filter((p) => !p.draft)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0))
}

/** 記事ページ側から自分のメタデータを引く。無ければビルドを落とす */
export function getPost(id: string): Post {
  const found = posts.find((p) => p.id === id)
  if (!found) throw new Error(`src/data/blog.ts に id: '${id}' の記事がありません`)
  return found
}

export function postsByCategory(categoryId: CategoryId): Post[] {
  return publishedPosts().filter((p) => p.categories.includes(categoryId))
}

/** 記事が1本以上あるカテゴリだけを、件数付きで返す */
export function categoriesWithCount(): { id: CategoryId; label: string; count: number }[] {
  return categories
    .map((c) => ({ id: c.id, label: c.label, count: postsByCategory(c.id).length }))
    .filter((c) => c.count > 0)
}

/** 記事下部の前後リンク用。prev = ひとつ新しい記事、next = ひとつ古い記事 */
export function adjacentPosts(id: string): { prev: Post | null; next: Post | null } {
  const list = publishedPosts()
  const index = list.findIndex((p) => p.id === id)
  if (index === -1) return { prev: null, next: null }
  return {
    prev: list[index - 1] ?? null,
    next: list[index + 1] ?? null,
  }
}

/** 'YYYY-MM-DD' → '2026.08.03' */
export function formatDate(date: string): string {
  return date.replaceAll('-', '.')
}
