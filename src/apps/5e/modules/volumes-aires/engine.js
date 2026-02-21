const P2D = [
  { gen: () => { const l=3+Math.floor(Math.random()*7), w=2+Math.floor(Math.random()*6); return { prompt:`Rectangle ${l}×${w} cm`, aire:l*w, perimetre:2*(l+w) } } },
  { gen: () => { const b=4+Math.floor(Math.random()*6), h=3+Math.floor(Math.random()*5); return { prompt:`Triangle base=${b} cm, h=${h} cm`, aire:(b*h)/2 } } },
  { gen: () => { const r=2+Math.floor(Math.random()*5); return { prompt:`Disque r=${r} cm`, aire:Math.round(Math.PI*r*r*100)/100 } } },
]
const P3D = [
  { gen: () => { const l=2+Math.floor(Math.random()*5), w=2+Math.floor(Math.random()*4), h=2+Math.floor(Math.random()*4); return { prompt:`Pavé ${l}×${w}×${h} cm`, volume:l*w*h } } },
  { gen: () => { const a=2+Math.floor(Math.random()*6); return { prompt:`Cube côté=${a} cm`, volume:a*a*a } } },
  { gen: () => { const r=2+Math.floor(Math.random()*4), h=3+Math.floor(Math.random()*6); return { prompt:`Cylindre r=${r}, h=${h} cm`, volume:Math.round(Math.PI*r*r*h*100)/100 } } },
]
export function generateProblem(level) {
  if (level <= 1) { const p = P2D[Math.floor(Math.random()*P2D.length)].gen(); return { ...p, question: "Calcule l'aire", answer: p.aire, unit: 'cm²' } }
  if (level === 2) { const use3d = Math.random()>0.4; if(use3d){const p=P3D[Math.floor(Math.random()*P3D.length)].gen(); return {...p, question:'Calcule le volume', answer:p.volume, unit:'cm³'}} const p=P2D[Math.floor(Math.random()*P2D.length)].gen(); return {...p, question:"Calcule l'aire", answer:p.aire, unit:'cm²'} }
  const p = P3D[Math.floor(Math.random()*P3D.length)].gen(); return { ...p, question: 'Calcule le volume', answer: p.volume, unit: 'cm³' }
}
