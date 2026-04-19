import { useState } from 'react';
import { Wrench, ExternalLink } from 'lucide-react';

interface Props {
  toolName: string;
  description?: string;
  note?: string;
}

export default function ComingSoon({ toolName, description, note }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ width: '72px', height: '72px', background: 'var(--bg-tertiary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
        <Wrench size={32} style={{ color: 'var(--accent-primary)' }} />
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{toolName}</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', maxWidth: '420px', margin: '0 auto 1rem' }}>
        {description ?? 'This tool is coming soon. We\'re working on adding it with full offline capability.'}
      </p>
      {note && (
        <div className="info-box" style={{ maxWidth: '420px', margin: '1rem auto 0', textAlign: 'left' }}>
          <ExternalLink size={14} />
          <span>{note}</span>
        </div>
      )}
    </div>
  );
}
