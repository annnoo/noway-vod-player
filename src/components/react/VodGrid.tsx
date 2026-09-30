import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, Eye, Film, Play, Search, SlidersHorizontal, Twitch } from 'lucide-react';

interface TwitchVideo {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  thumbnailUrl: string;
  duration: string | number;
  viewCount: number;
}

const durationSeconds = (value: string | number) => {
  if (typeof value === 'number') return value;
  const iso = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (iso) return Number(iso[1] || 0) * 3600 + Number(iso[2] || 0) * 60 + Number(iso[3] || 0);
  const hours = Number(value.match(/(\d+)h/i)?.[1] || 0);
  const minutes = Number(value.match(/(\d+)m/i)?.[1] || 0);
  const seconds = Number(value.match(/(\d+)s/i)?.[1] || 0);
  return hours * 3600 + minutes * 60 + seconds;
};

const formatDuration = (value: string | number) => {
  const seconds = Math.max(0, Math.floor(durationSeconds(value)));
  return `${Math.floor(seconds / 3600).toString().padStart(2, '0')}:${Math.floor(seconds % 3600 / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
};

const formatDate = (value: string) => new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });

const VodGrid: React.FC<{ username: string; limit?: number }> = ({ username, limit = 20 }) => {
  const [videos, setVideos] = useState<TwitchVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/twitch/videos?username=${encodeURIComponent(username)}&limit=${limit}`);
      if (!response.ok) throw new Error('Die Streams konnten nicht geladen werden.');
      const data = await response.json();
      if (!Array.isArray(data.videos)) throw new Error('Die Stream-Daten sind nicht verfügbar.');
      setVideos(data.videos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Streams konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, [username, limit]);

  const visible = useMemo(() => videos.filter(video => `${video.title} ${video.description || ''}`.toLocaleLowerCase('de').includes(search.toLocaleLowerCase('de').trim())).sort((a, b) => {
    if (sort === 'longest') return durationSeconds(b.duration) - durationSeconds(a.duration);
    if (sort === 'popular') return b.viewCount - a.viewCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }), [videos, search, sort]);

  const featured = visible[0];
  const thumbnail = (url: string, width = 640, height = 360) => url?.replace('%{width}', String(width)).replace('%{height}', String(height));

  return <div className="archive-page">
    <div className="archive-glow" aria-hidden="true" />
    <div className="archive-shell">
      <div className="archive-intro"><span className="eyebrow"><span className="pulse-dot" /> DAS OFFIZIELLE STREAM-ARCHIV</span><h1>Jeder Stream.<br /><em>Jeder Moment.</em></h1><p>Dein Shortcut zu den besten Matches, wilden Plays und ganzen Stream-Sessions von Noway4u.</p></div>

      {loading ? <div className="archive-message" role="status"><span className="loading-ring" />Streams werden geladen ...</div> : error ? <div className="archive-message" role="alert"><p>{error}</p><button type="button" className="solid-button" onClick={fetchVideos}>Erneut versuchen <ArrowRight size={16} /></button></div> : videos.length === 0 ? <div className="archive-message"><Film size={30} /><p>Aktuell sind keine VODs verfügbar.</p></div> : <>
        {featured && <section className="featured-vod" aria-label="Aktueller Stream"><a href={`/vod/${featured.id}`} className="featured-image"><img src={thumbnail(featured.thumbnailUrl, 1280, 720)} alt="" /><span className="featured-play"><Play size={28} fill="currentColor" /></span></a><div className="featured-copy"><span className="eyebrow"><span className="pulse-dot" /> DEIN NÄCHSTER STREAM</span><h2>{featured.title}</h2><p>Mach genau da weiter, wo die Action beginnt. Der gesamte Stream mit interaktiver Match-Timeline und allen Highlights.</p><div className="featured-meta"><span><CalendarDays size={15} /> {formatDate(featured.createdAt)}</span><span><Clock3 size={15} /> {formatDuration(featured.duration)}</span></div><a href={`/vod/${featured.id}`} className="solid-button">VOD ansehen <ArrowRight size={17} /></a></div></section>}

        <section className="archive-list" aria-label="Stream-Archiv"><div className="archive-heading"><div><span className="eyebrow">ALLE AUFZEICHNUNGEN</span><h2>Im Archiv<span className="mint-dot">.</span></h2></div><span className="archive-count">{visible.length} von {videos.length} VODs</span></div>
          <div className="archive-controls"><label className="archive-search"><Search size={18} /><span className="sr-only">Streams suchen</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Stream-Titel durchsuchen ..." /></label><label className="archive-sort"><SlidersHorizontal size={17} /><span className="sr-only">Sortierung</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="recent">Neueste zuerst</option><option value="longest">Längste Streams</option><option value="popular">Meistgesehen</option></select></label></div>
          {visible.length === 0 ? <div className="archive-message">Keine Streams gefunden. Versuche einen anderen Suchbegriff.</div> : <div className="vod-grid">{visible.map(video => <article className="vod-card" key={video.id}><a href={`/vod/${video.id}`} className="vod-image"><img src={thumbnail(video.thumbnailUrl)} alt="" loading="lazy" /><span className="vod-image-shade" /><span className="vod-date"><CalendarDays size={12} /> {formatDate(video.createdAt)}</span><span className="vod-length">{formatDuration(video.duration)}</span><span className="vod-hover-play"><Play size={22} fill="currentColor" /></span></a><div className="vod-card-body"><span className="vod-kind"><Twitch size={14} /> STREAM-AUFZEICHNUNG</span><h3><a href={`/vod/${video.id}`}>{video.title}</a></h3><div className="vod-bottom"><span><Eye size={14} /> {video.viewCount.toLocaleString('de-DE')} Aufrufe</span><a href={`/vod/${video.id}`} aria-label={`${video.title} ansehen`}><ArrowRight size={18} /></a></div></div></article>)}</div>}
        </section>
      </>}
    </div>
  </div>;
};

export default VodGrid;
