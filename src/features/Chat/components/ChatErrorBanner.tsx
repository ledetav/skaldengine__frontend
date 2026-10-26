interface ChatErrorBannerProps {
  error: string | null
  onClose: () => void
}

export function ChatErrorBanner({ error, onClose }: ChatErrorBannerProps) {
  if (!error) return null

  return (
    <div style={{
      margin: '0 24px 16px',
      padding: '12px 16px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderLeft: '4px solid var(--accent-red)',
      borderRadius: '0 8px 8px 0',
      color: '#fca5a5',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)',
      backdropFilter: 'blur(8px)',
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span style={{ flex: 1 }}>{error}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.8rem',
          textDecoration: 'underline'
        }}
      >
        Закрыть
      </button>
    </div>
  )
}
