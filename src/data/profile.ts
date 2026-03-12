// ── プロフィール ──────────────────────────────────────
export const profile = {
  name: '耳たぶ',
  nameEn: 'mimitab',
  sns: [
    { label: 'X: link',    href: 'https://x.com/' },
    { label: 'Zenn: link', href: 'https://zenn.dev/' },
  ],
  bio: [
    '始めまして。耳たぶと言います。',
    '開発エンジニア、QAエンジニアをしています。',
    '不便を取り除き、触っていて心地の良いソフトウェアが好きです。',
    '不便が解消される瞬間が好きで、プロダクトしても業務改善としても作っていきたいなと思っています。',
  ],
  iconCredit: 'アイコンはYusuke Endo / en.さんのHumationを利用させていただいてます。とてもかわいい',
}

// ── やっていきたいこと ────────────────────────────────
export const goals = [
  {
    label: '共通すること',
    body: '不便が解消されることが好きです。触っていてこれ便利だな〜と思えるもの、そして人が便利を感じてくれることにつながる活動がしていきたいと思ってます。',
  },
  {
    label: 'なぜQA？',
    body: 'ユーザと開発者のためです。便利なものは使っていて心地良くあって欲しい。これが品質の一つの要素であると考えています。また、検証作業は開発工程の中でも時間がかかり好まない人もいる領域と捉えています。検証にかかるコストをテスト自動化やプロセスで最適化し、開発者にとっても便利で開発しやすい環境を作る。これもQAの役割の一つだと思っています。',
  },
]

// ── 使用している技術 ──────────────────────────────────
export const techs = [
  { label: 'Frontend:', items: ['Vue.js', 'Nuxt.js', 'Vuetify'] },
  { label: 'Backend :', items: ['Spring Boot'] },
  { label: 'Platform:', items: ['AWS'] },
  { label: 'Test      :', items: ['Playwright', 'Junit5', 'Vitest'] },
]
