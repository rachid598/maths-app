export function generateProblem(level = 1) {
  if (level === 1) { const s=2+Math.floor(Math.random()*8); const ask=Math.random()>0.5; return { shapeName:'Carré', prompt:`Carré côté ${s} cm`, question:ask?'Périmètre ?':'Aire ?', answer:ask?4*s:s*s, type:ask?'périmètre':'aire' } }
  if (level === 2) { const l=3+Math.floor(Math.random()*7), w=2+Math.floor(Math.random()*5); const ask=Math.random()>0.5; return { shapeName:'Rectangle', prompt:`Rectangle ${l}×${w} cm`, question:ask?'Périmètre ?':'Aire ?', answer:ask?2*(l+w):l*w, type:ask?'périmètre':'aire' } }
  const a=3+Math.floor(Math.random()*5), b=3+Math.floor(Math.random()*5); return { shapeName:'Triangle rectangle', prompt:`Triangle rect. côtés ${a} et ${b} cm`, question:'Aire ?', answer:(a*b)/2, type:'aire' }
}
