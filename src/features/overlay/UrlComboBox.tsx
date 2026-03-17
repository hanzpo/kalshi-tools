import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { oe } from './styles';

export const SceneUrlsContext = createContext<string[]>([]);

export function UrlComboBox({ value, onChange, placeholder }: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) {
  const sceneUrls = useContext(SceneUrlsContext);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options = sceneUrls.filter(u => u && u !== value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Extract a short label from a URL for display
  const shortLabel = (url: string) => {
    try {
      const path = new URL(url.startsWith('http') ? url : `https://${url}`).pathname;
      const parts = path.split('/').filter(Boolean);
      return parts[parts.length - 1]?.toUpperCase() || url;
    } catch {
      return url;
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 0 }}>
        <input
          type="text"
          className={oe.input}
          style={options.length > 0 ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 } : undefined}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {options.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, flexShrink: 0, cursor: 'pointer',
              background: 'var(--color-dark-elevated, #1a1a1a)',
              border: '1px solid var(--color-dark-border-light, #333)',
              borderLeft: 'none',
              borderRadius: '0 6px 6px 0',
              color: 'var(--color-text-muted, #6b7280)',
              transition: 'color 150ms, border-color 150ms',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = '#09C285'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = ''; }}
            title="Reuse URL from scene"
          >
            <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points={open ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
            </svg>
          </button>
        )}
      </div>
      {open && options.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          marginTop: 2, zIndex: 50,
          background: 'var(--color-dark-elevated, #1a1a1a)',
          border: '1px solid var(--color-dark-border-light, #333)',
          borderRadius: 6, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {options.map(url => (
            <button
              key={url}
              type="button"
              onClick={() => { onChange(url); setOpen(false); }}
              style={{
                display: 'flex', flexDirection: 'column', gap: 1,
                width: '100%', padding: '7px 10px', cursor: 'pointer',
                background: 'none', border: 'none', textAlign: 'left',
                transition: 'background 100ms',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(9,194,133,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: '#09C285' }}>
                {shortLabel(url)}
              </span>
              <span style={{
                fontSize: 10, color: 'var(--color-text-muted, #6b7280)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}>
                {url}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
