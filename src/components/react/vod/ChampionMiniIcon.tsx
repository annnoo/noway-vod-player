import React from 'react';

export default function ChampionMiniIcon({ id, name, className = '' }: { id: number; name: string; className?: string }) {
  return <span className={`champion-mini ${className}`} aria-hidden="true">
    <span>{(name || '?').slice(0, 1)}</span>
    {id > 0 && <img src={`https://cdn.nowaycdn.com/images/champions/square/32x/${id}.png`} alt="" loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} />}
  </span>;
}
