/**
 * Renders an expression with tappable operators.
 * Numbers and parentheses are static, operators are buttons.
 */
export default function ExpressionDisplay({
  tokens,
  selectedOpId,
  onSelectOp,
  disabled,
}) {
  return (
    <div className="flex items-center justify-center gap-1 flex-wrap font-mono text-2xl">
      {tokens.map((token, i) => {
        if (token.type === 'number') {
          return (
            <span key={i} className="px-1 tabular-nums">
              {token.value}
            </span>
          )
        }
        if (token.type === 'paren') {
          return (
            <span key={i} className="text-accent font-bold px-0.5">
              {token.value}
            </span>
          )
        }
        if (token.type === 'operator') {
          const isSelected = selectedOpId === token.id
          return (
            <button
              key={token.id}
              type="button"
              onClick={() => !disabled && onSelectOp(token.id)}
              disabled={disabled}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all ${
                isSelected
                  ? 'bg-primary text-white scale-110'
                  : 'text-slate-300 hover:bg-surface-light active:bg-primary/30'
              } disabled:opacity-50`}
            >
              {token.value}
            </button>
          )
        }
        return null
      })}
    </div>
  )
}
