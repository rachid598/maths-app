import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import Keypad from '../../components/Keypad'
import PageTransition from '../../components/PageTransition'
import { useSound } from '../../hooks/useSound'

const ROUNDS = 5
const ALL_TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10]

function genQuestion() {
  const a = ALL_TABLES[Math.floor(Math.random() * ALL_TABLES.length)]
  const b = Math.floor(Math.random() * 9) + 2
  return { display: `${a} \u00D7 ${b} = ?`, answer: a * b }
}

function generateRound() {
  return Array.from({ length: ROUNDS }, () => genQuestion())
}

export default function Duel({ onBadgeCheck }) {
  const navigate = useNavigate()
  const { playSuccess, playError, playConfetti } = useSound()
  const [phase, setPhase] = useState('setup')
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [questions, setQuestions] = useState([])
  const [qi, setQi] = useState(0)
  const [input, setInput] = useState('')
  const [scores, setScores] = useState([0, 0])
  const [feedback, setFeedback] = useState(null)
  const feedbackRef = useRef(null)

  const question = questions[qi]

  const startGame = useCallback(() => {
    if (player1.trim().length < 1 || player2.trim().length < 1) return
    setQuestions(generateRound())
    setQi(0); setInput(''); setScores([0, 0]); setCurrentPlayer(1); setFeedback(null); setPhase('play')
  }, [player1, player2])

  const handleSubmit = useCallback(() => {
    if (!question || feedback) return
    const correct = parseInt(input, 10) === question.answer
    if (correct) {
      setScores(s => { const n = [...s]; n[currentPlayer - 1]++; return n })
      setFeedback('correct')
      playSuccess()
    } else {
      setFeedback('wrong')
      playError()
    }

    feedbackRef.current = setTimeout(() => {
      setFeedback(null); setInput('')

      if (currentPlayer === 1) {
        setCurrentPlayer(2)
      } else {
        if (qi + 1 >= ROUNDS) {
          setPhase('result')
        } else {
          setQi(q => q + 1)
          setCurrentPlayer(1)
        }
      }
    }, correct ? 400 : 1000)
  }, [question, input, feedback, currentPlayer, qi, playSuccess, playError])

  useEffect(() => {
    if (phase === 'result') {
      const winner = scores[0] > scores[1] ? 1 : scores[1] > scores[0] ? 2 : 0
      if (winner > 0 && onBadgeCheck) onBadgeCheck()
      playConfetti()
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } })
    }
  }, [phase])

  useEffect(() => () => { if (feedbackRef.current) clearTimeout(feedbackRef.current) }, [])

  if (phase === 'setup') {
    return (
      <PageTransition><div className="flex flex-col items-center justify-center min-h-screen bg-surface dark:bg-gray-900 px-4">
        <div className="animate-pop-in text-center max-w-sm w-full">
          <div className="text-6xl mb-4">{'\uD83E\uDD4A'}</div>
          <h1 className="text-3xl font-extrabold text-primary-dark dark:text-primary-light mb-4">Duel Local</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">2 joueurs, 1 telephone, chacun son tour !</p>
          <div className="space-y-3 mb-6">
            <input value={player1} onChange={e => setPlayer1(e.target.value)} placeholder="Joueur 1" maxLength={15}
              className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:outline-none text-lg bg-white dark:bg-gray-800 dark:text-white" />
            <input value={player2} onChange={e => setPlayer2(e.target.value)} placeholder="Joueur 2" maxLength={15}
              className="w-full px-4 py-3 rounded-xl border-2 border-red-300 focus:border-red-500 focus:outline-none text-lg bg-white dark:bg-gray-800 dark:text-white" />
          </div>
          <button onClick={startGame} disabled={player1.trim().length < 1 || player2.trim().length < 1}
            className="w-full py-4 rounded-xl bg-primary text-white font-bold text-xl active:scale-95 transition-transform disabled:opacity-40">Commencer le duel !</button>
          <button onClick={() => navigate('/')} className="mt-4 text-sm text-gray-500 dark:text-gray-400">{'\u2190'} Retour au Hub</button>
        </div>
      </div></PageTransition>
    )
  }

  if (phase === 'result') {
    const winner = scores[0] > scores[1] ? player1 : scores[1] > scores[0] ? player2 : null
    return (
      <PageTransition><div className="flex flex-col items-center justify-center min-h-screen bg-surface dark:bg-gray-900 px-4">
        <div className="animate-pop-in text-center">
          <div className="text-7xl mb-4">{winner ? '\uD83C\uDFC6' : '\uD83E\uDD1D'}</div>
          <h2 className="text-2xl font-extrabold text-primary-dark dark:text-primary-light mb-4">
            {winner ? `${winner} gagne !` : 'Egalite !'}
          </h2>
          <div className="flex gap-6 justify-center mb-8">
            <div className="text-center">
              <p className="text-blue-500 font-bold">{player1}</p>
              <p className="text-3xl font-extrabold">{scores[0]}</p>
            </div>
            <div className="text-4xl text-gray-300">vs</div>
            <div className="text-center">
              <p className="text-red-500 font-bold">{player2}</p>
              <p className="text-3xl font-extrabold">{scores[1]}</p>
            </div>
          </div>
          <button onClick={startGame} className="w-full py-3 rounded-xl bg-primary text-white font-bold active:scale-95 transition-transform mb-3">Revanche !</button>
          <button onClick={() => navigate('/')} className="text-sm text-gray-500 dark:text-gray-400">{'\u2190'} Retour au Hub</button>
        </div>
      </div></PageTransition>
    )
  }

  const name = currentPlayer === 1 ? player1 : player2
  const color = currentPlayer === 1 ? 'text-blue-500 border-blue-400' : 'text-red-500 border-red-400'
  const feedbackColor = feedback === 'correct' ? 'border-success bg-emerald-50 dark:bg-emerald-950' : feedback === 'wrong' ? 'border-danger bg-red-50 dark:bg-red-950 animate-shake' : `border-transparent bg-white dark:bg-gray-800`

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
      <header className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
        <span className="text-sm"><span className="text-blue-500 font-bold">{player1} {scores[0]}</span> <span className="text-gray-400">vs</span> <span className="text-red-500 font-bold">{scores[1]} {player2}</span></span>
        <span className="text-xs text-gray-400">Q{qi + 1}/{ROUNDS}</span>
      </header>

      <div className="text-center py-3">
        <span className={`text-lg font-extrabold ${color}`}>{'\uD83C\uDFAF'} Tour de {name}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <div className={`w-full max-w-sm rounded-2xl border-3 p-6 shadow-lg transition-all duration-200 ${feedbackColor}`}>
          <p className="text-center text-3xl font-extrabold text-gray-800 dark:text-gray-100 tracking-wide">{question?.display}</p>
          <div className="mt-4 text-center"><div className="inline-block min-w-[80px] border-b-4 border-primary pb-1"><span className="text-4xl font-bold text-primary">{input || '\u00A0'}</span></div></div>
          {feedback === 'wrong' && <p className="text-center text-danger font-bold mt-3 animate-pop-in">{question.answer}</p>}
        </div>
        <Keypad value={input} onChange={setInput} onSubmit={handleSubmit} disabled={!!feedback} />
      </div>
    </div>
  )
}
