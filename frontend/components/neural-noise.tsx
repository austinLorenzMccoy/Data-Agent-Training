export function NeuralNoise({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0, transparent 27px, rgba(44, 82, 130, 0.07) 28px)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent 72%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent 72%)',
        }}
      />
      <div
        className="absolute top-0 bottom-0 w-px bg-primary/25"
        style={{ left: 'max(1.25rem, calc(50% - 22rem))' }}
      />
    </div>
  )
}
