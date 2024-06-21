export default function PlayerStyleLogo() {
  return (
    <div>
      <span className="font-mono" style={{ fontSize: '1.6rem' }}>
        player
      </span>
      <span
        className="relative -top-2px"
        style={{
          fontSize: '1.4rem',
          fontFamily: 'var(--font-knewave)',
        }}
      >
        <span className="relative -left-3px">.</span>
        <span>style</span>
      </span>
    </div>
  );
}
