import { describe, expect, it } from 'vitest'
import {
  adjacentPosts,
  categories,
  categoriesWithCount,
  categoryLabel,
  formatDate,
  getPost,
  isCategoryId,
  posts,
  postsByCategory,
  publishedPosts,
} from './blog'

describe('publishedPosts', () => {
  it('publishedAt の新しい順に並ぶ', () => {
    const list = publishedPosts()
    const dates = list.map((p) => p.publishedAt)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('draft の記事を含まない', () => {
    expect(publishedPosts().every((p) => !p.draft)).toBe(true)
  })

  it('元の posts 配列を破壊的に並べ替えない', () => {
    const before = posts.map((p) => p.id)
    publishedPosts()
    expect(posts.map((p) => p.id)).toEqual(before)
  })
})

describe('getPost', () => {
  it('id で記事を引ける', () => {
    const first = posts[0]!
    expect(getPost(first.id)).toEqual(first)
  })

  it('存在しない id は throw する（ビルドを落とすため）', () => {
    expect(() => getPost('no-such-post')).toThrow(/no-such-post/)
  })
})

describe('postsByCategory', () => {
  it('そのカテゴリを持つ公開記事だけを返す', () => {
    for (const c of categories) {
      const list = postsByCategory(c.id)
      expect(list.every((p) => p.categories.includes(c.id) && !p.draft)).toBe(true)
    }
  })

  it('件数の合計がカテゴリ付与数の合計と一致する', () => {
    const total = categories.reduce((sum, c) => sum + postsByCategory(c.id).length, 0)
    const expected = publishedPosts().reduce((sum, p) => sum + p.categories.length, 0)
    expect(total).toBe(expected)
  })
})

describe('categoriesWithCount', () => {
  it('記事が0件のカテゴリは含めない', () => {
    expect(categoriesWithCount().every((c) => c.count > 0)).toBe(true)
  })

  it('count が postsByCategory の件数と一致する', () => {
    for (const c of categoriesWithCount()) {
      expect(c.count).toBe(postsByCategory(c.id).length)
    }
  })
})

describe('adjacentPosts', () => {
  const list = publishedPosts()

  it('最新の記事には prev が無い', () => {
    expect(adjacentPosts(list[0]!.id).prev).toBeNull()
  })

  it('最古の記事には next が無い', () => {
    expect(adjacentPosts(list[list.length - 1]!.id).next).toBeNull()
  })

  it('prev はひとつ新しい記事、next はひとつ古い記事', () => {
    list.forEach((post, i) => {
      const { prev, next } = adjacentPosts(post.id)
      expect(prev?.id ?? null).toBe(list[i - 1]?.id ?? null)
      expect(next?.id ?? null).toBe(list[i + 1]?.id ?? null)
    })
  })

  it('存在しない id では両方 null', () => {
    expect(adjacentPosts('no-such-post')).toEqual({ prev: null, next: null })
  })
})

describe('カテゴリのヘルパー', () => {
  it('categoryLabel が定義どおりのラベルを返す', () => {
    for (const c of categories) {
      expect(categoryLabel(c.id)).toBe(c.label)
    }
  })

  it('isCategoryId が未知の値を弾く', () => {
    expect(isCategoryId('qa')).toBe(true)
    expect(isCategoryId('not-a-category')).toBe(false)
  })
})

describe('formatDate', () => {
  it('YYYY-MM-DD をドット区切りにする', () => {
    expect(formatDate('2026-08-03')).toBe('2026.08.03')
  })
})
