export default function BackgroundDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="geometric-blob"
        style={{
          width: '500px',
          height: '500px',
          top: '-150px',
          right: '-100px',
          background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
          opacity: 0.07,
        }}
      />
      <div
        className="geometric-blob"
        style={{
          width: '400px',
          height: '400px',
          bottom: '-120px',
          left: '-80px',
          background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
          opacity: 0.07,
        }}
      />
      <div
        className="geometric-blob"
        style={{
          width: '350px',
          height: '350px',
          top: '40%',
          left: '60%',
          background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
          opacity: 0.05,
        }}
      />
    </div>
  )
}
