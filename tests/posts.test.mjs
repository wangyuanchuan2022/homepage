// Unit tests for blog pure logic (postsCore.ts) — Node 24 strips TS types natively.
// Run: node tests/posts.test.mjs
import assert from 'node:assert/strict'
import { formatPostDate, mergePosts, parseFrontmatter, slugifyTitle, uniqueSlug } from '../src/data/postsCore.ts'

let passed = 0
function check(name, fn) {
  try {
    fn()
    passed++
    console.log(`[OK] ${name}`)
  } catch (e) {
    console.log(`[FAIL] ${name} -- ${e.message}`)
    process.exitCode = 1
  }
}

const seed = (slug, title, date) => ({ slug, title, date, body: `body of ${slug}`, source: 'seed' })

check('parseFrontmatter: attrs + body', () => {
  const { attrs, body } = parseFrontmatter('---\nslug: hello\ntitle: 你好\n---\n\n正文第一行\n\n正文第二行')
  assert.deepEqual(attrs, { slug: 'hello', title: '你好' })
  assert.equal(body, '正文第一行\n\n正文第二行')
})

check('parseFrontmatter: no frontmatter passthrough', () => {
  const { attrs, body } = parseFrontmatter('just text')
  assert.deepEqual(attrs, {})
  assert.equal(body, 'just text')
})

check('slugifyTitle: ascii normalizes', () => {
  assert.equal(slugifyTitle('Hello World! 2026'), 'hello-world-2026')
})

check('slugifyTitle: pure CJK falls back', () => {
  assert.equal(slugifyTitle('古籍检索笔记', 'post'), 'post')
})

check('slugifyTitle: mixed keeps ascii part', () => {
  assert.equal(slugifyTitle('guji 笔记'), 'guji')
})

check('uniqueSlug: free base passes through', () => {
  assert.equal(uniqueSlug('hello', ['a', 'b']), 'hello')
})

check('uniqueSlug: collisions append -2, -3', () => {
  assert.equal(uniqueSlug('hello', ['hello']), 'hello-2')
  assert.equal(uniqueSlug('hello', ['hello', 'hello-2']), 'hello-3')
})

check('mergePosts: local shadows seed, tombstone removes, sorted desc', () => {
  const seeds = [seed('a', 'A 原版', '2026-09-02'), seed('b', 'B', '2026-09-01')]
  const local = [
    { slug: 'a', title: 'A 已编辑', date: '2026-09-02', body: 'new', source: 'local', updatedAt: '2026-09-03T10:00:00' },
    { slug: 'c', title: 'C 最新', date: '2026-09-05', body: 'c', source: 'local' },
  ]
  const merged = mergePosts(seeds, local, ['b'])
  assert.deepEqual(
    merged.map((p) => [p.slug, p.title, p.source]),
    [
      ['c', 'C 最新', 'local'],
      ['a', 'A 已编辑', 'local'],
    ],
  )
})

check('formatPostDate: date-only and datetime shapes', () => {
  assert.equal(formatPostDate('2026-09-10'), '2026-09-10')
  assert.equal(formatPostDate('2026-09-10T08:05:00'), '2026-09-10 08:05')
})

console.log(`\nSUMMARY: ${passed}/9 passed`)
if (process.exitCode) console.log('FAILED')
else console.log('ALL-PASS')
