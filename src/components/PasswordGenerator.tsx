import { useState } from 'react';
import { Key, Copy, RefreshCw } from 'lucide-react';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(1);

  const generate = () => {
    let charset = '';
    if (upper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!charset) { setPassword('Select at least one character type'); return; }

    const arr = Array.from({ length: count }, () =>
      Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('')
    );
    setPassword(arr.join('\n'));
    setCopied(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = () => {
    const s = [upper, lower, numbers, symbols].filter(Boolean).length;
    if (length < 8 || s < 2) return { label: 'Weak', color: 'var(--accent-red)' };
    if (length < 12 || s < 3) return { label: 'Fair', color: 'var(--accent-yellow)' };
    if (length < 16 || s < 4) return { label: 'Strong', color: 'var(--accent-green)' };
    return { label: 'Very Strong', color: '#06d6a0' };
  };

  const { label, color } = strength();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="controls-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <div className="control-row">
            <span className="control-label">Password Length</span>
            <span className="control-value">{length}</span>
          </div>
          <input type="range" className="slider" min={4} max={64} value={length} onChange={e => setLength(+e.target.value)} />
        </div>
        <div>
          <div className="control-row">
            <span className="control-label">How many to generate</span>
            <span className="control-value">{count}</span>
          </div>
          <input type="range" className="slider" min={1} max={20} value={count} onChange={e => setCount(+e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {[
            { label: 'Uppercase (A-Z)', val: upper, set: setUpper },
            { label: 'Lowercase (a-z)', val: lower, set: setLower },
            { label: 'Numbers (0-9)', val: numbers, set: setNumbers },
            { label: 'Symbols (!@#)', val: symbols, set: setSymbols },
          ].map(({ label, val, set }) => (
            <label key={label} className="checkbox-row">
              <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} />
              {label}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Strength:</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{label}</span>
        </div>
      </div>

      <button className="btn btn-primary" onClick={generate}>
        <RefreshCw size={16} /> Generate Password{count > 1 ? 's' : ''}
      </button>

      {password && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', position: 'relative' }}>
          <pre style={{ fontFamily: 'monospace', fontSize: '0.9rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--accent-primary)', margin: 0 }}>{password}</pre>
          <button className="btn btn-secondary btn-sm" style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }} onClick={copy}>
            {copied ? '✓ Copied!' : <><Copy size={14} /> Copy</>}
          </button>
        </div>
      )}
    </div>
  );
}
