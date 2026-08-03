import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { RESERVED_IDS, isCategoryId, posts } from './blog'

// 記事の実体（src/pages/blog/{id}.astro）とメタデータ（src/data/blog.ts）は
// 別ファイルなので、片方だけ足して忘れる事故が起きうる。
// このテストがその二重管理をガードする。

const BLOG_PAGES_DIR = fileURLToPath(new URL('../pages/blog', import.meta.url))

/** src/pages/blog 直下の記事ページのファイル名（拡張子なし）。index は除く */
const pageIds = readdirSync(BLOG_PAGES_DIR, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith('.astro') && e.name !== 'index.astro')
  .map((e) => e.name.replace(/\.astro$/, ''))
  .sort()

const registryIds = posts.map((p) => p.id).sort()

describe('レジストリとページファイルの対応', () => {
  it('ページがあるのに src/data/blog.ts に登録されていない記事が無い', () => {
    const missing = pageIds.filter((id) => !registryIds.includes(id))
    expect(missing, `src/data/blog.ts に登録してください: ${missing.join(', ')}`).toEqual([])
  })

  it('登録されているのに src/pages/blog/{id}.astro が無い記事が無い', () => {
    const missing = registryIds.filter((id) => !pageIds.includes(id))
    expect(missing, `ページを作成してください: ${missing.map((id) => `src/pages/blog/${id}.astro`).join(', ')}`).toEqual([])
  })
})

describe('記事 id', () => {
  it('重複していない', () => {
    expect(new Set(registryIds).size).toBe(registryIds.length)
  })

  it('ルーティング上の予約語と衝突していない', () => {
    for (const id of registryIds) {
      expect(RESERVED_IDS as readonly string[]).not.toContain(id)
    }
  })

  it('URL に使える形（英小文字・数字・ハイフン）になっている', () => {
    for (const id of registryIds) {
      expect(id, `id が不正です: ${id}`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })
})

describe('記事メタデータ', () => {
  it.each(posts.map((p) => [p.id, p] as const))('%s', (_id, post) => {
    expect(post.title.trim().length, 'title が空です').toBeGreaterThan(0)
    expect(post.description.trim().length, 'description が空です').toBeGreaterThan(0)

    for (const [field, value] of [
      ['publishedAt', post.publishedAt],
      ['updatedAt', post.updatedAt],
    ] as const) {
      if (value === undefined) continue
      expect(value, `${field} は YYYY-MM-DD 形式で書いてください`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(
        Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
        `${field} が実在しない日付です: ${value}`
      ).toBe(false)
    }

    if (post.updatedAt) {
      expect(post.updatedAt >= post.publishedAt, 'updatedAt が publishedAt より前です').toBe(true)
    }

    expect(post.categories.length, 'categories が空です').toBeGreaterThan(0)
    expect(new Set(post.categories).size, 'categories が重複しています').toBe(post.categories.length)
    for (const c of post.categories) {
      expect(isCategoryId(c), `未知のカテゴリです: ${c}`).toBe(true)
    }
  })
})
