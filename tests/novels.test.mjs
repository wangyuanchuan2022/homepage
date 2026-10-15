// Unit tests for novel pure logic (novelsCore.ts) — Node 24 strips TS types natively.
// Run: node tests/novels.test.mjs
import assert from 'node:assert/strict'
import { chapterNeighbors, chapterWordCount, parseSections, sortChapters } from '../src/data/novelsCore.ts'

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

const chapter = (slug, number, date = '2026-10-14') => ({
  slug,
  novelId: 'duanlian',
  number,
  title: `第${number}章`,
  date,
  body: `body of ${slug}`,
})

check('parseSections: splits at ## headings, ids stable by order', () => {
  const secs = parseSections('## 甲\n\n内容一。\n\n## 乙\n\n内容二。\n')
  assert.equal(secs.length, 2)
  assert.deepEqual(
    secs.map((s) => [s.id, s.title]),
    [
      ['sec-1', '甲'],
      ['sec-2', '乙'],
    ],
  )
  assert.equal(secs[0].content, '\n内容一。\n\n')
  assert.ok(!secs[0].content.includes('## 甲'))
})

check('parseSections: drops a redundant leading # title line', () => {
  const secs = parseSections('# 第一章\n\n## 节1-配给照旧\n\n正文。\n')
  assert.equal(secs.length, 1)
  assert.equal(secs[0].title, '节1-配给照旧')
  assert.ok(!secs[0].content.includes('# 第一章'))
})

check('parseSections: prose before the first ## becomes untitled sec-0', () => {
  const secs = parseSections('引子一段。\n\n## 节1\n\n正文。\n')
  assert.equal(secs.length, 2)
  assert.equal(secs[0].id, 'sec-0')
  assert.equal(secs[0].title, '')
  assert.ok(secs[0].content.includes('引子一段。'))
})

check('parseSections: body without any ## stays one untitled section', () => {
  const secs = parseSections('只有正文。\n')
  assert.equal(secs.length, 1)
  assert.equal(secs[0].title, '')
  assert.ok(secs[0].content.includes('只有正文。'))
})

check('chapterWordCount: whitespace excluded, punctuation included, heading lines excluded', () => {
  assert.equal(chapterWordCount('## 节1\n\nAB CD\n\n中文。'), 7) // ABCD中文。
  assert.equal(chapterWordCount('# 第一章　配给照旧\n\n正文。'), 3) // 全文标题行整行剔除，只计正文。
  assert.equal(chapterWordCount(''), 0)
})

check('sortChapters: ascending by number, date tiebreak, input not mutated', () => {
  const input = [chapter('c', 3), chapter('a', 1, '2026-10-15'), chapter('b', 1, '2026-10-14')]
  const sorted = sortChapters(input)
  assert.deepEqual(
    sorted.map((c) => c.slug),
    ['b', 'a', 'c'],
  )
  assert.deepEqual(
    input.map((c) => c.slug),
    ['c', 'a', 'b'],
  )
})

check('chapterNeighbors: middle / first / last / unknown', () => {
  const list = [chapter('p', 1), chapter('mid', 2), chapter('n', 3)]
  assert.deepEqual(chapterNeighbors(list, 'mid'), { prev: list[0], next: list[2] })
  assert.deepEqual(chapterNeighbors(list, 'p'), { prev: undefined, next: list[1] })
  assert.deepEqual(chapterNeighbors(list, 'n'), { prev: list[1], next: undefined })
  assert.deepEqual(chapterNeighbors(list, 'nope'), {})
})

console.log(`\nSUMMARY: ${passed}/7 passed`)
if (process.exitCode) console.log('FAILED')
else console.log('ALL-PASS')
