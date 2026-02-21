function pythagore() {
  const triples = [[3,4,5],[5,12,13],[6,8,10],[8,15,17],[7,24,25],[9,12,15]]
  const t = triples[Math.floor(Math.random()*triples.length)]
  const k = 1 + Math.floor(Math.random()*3)
  const [a, b, c] = t.map(v => v * k)
  const hide = Math.floor(Math.random()*3)
  if (hide === 2) return { type:'pythagore', prompt:'Côtés '+a+' et '+b+' cm. Hypoténuse ?', answer:c, explanation:'c² = '+a+'² + '+b+'² = '+(c*c)+' → c = '+c }
  if (hide === 1) return { type:'pythagore', prompt:'Côté '+a+' cm, hypoténuse '+c+' cm. Autre côté ?', answer:b, explanation:'b² = '+c+'² - '+a+'² = '+(b*b)+' → b = '+b }
  return { type:'pythagore', prompt:'Côté '+b+' cm, hypoténuse '+c+' cm. Autre côté ?', answer:a, explanation:'a² = '+c+'² - '+b+'² = '+(a*a)+' → a = '+a }
}
function thales() {
  const k = [1.5, 2, 2.5, 3, 4][Math.floor(Math.random()*5)]
  const ab = 2 + Math.floor(Math.random()*6), ac = 3 + Math.floor(Math.random()*5)
  const am = ab * k, an = ac * k
  if (Math.random()>0.5) return { type:'thales', prompt:'AB='+ab+', AC='+ac+', AM='+am+'. AN ?', answer:an, explanation:'AN = AC×AM/AB = '+an }
  return { type:'thales', prompt:'AB='+ab+', AM='+am+', AN='+an+'. AC ?', answer:ac, explanation:'AC = AN×AB/AM = '+ac }
}
export function generateProblem() { return Math.random() > 0.5 ? pythagore() : thales() }
