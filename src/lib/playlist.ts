export interface StreamPlaylist {
  spotifyUrl?: string | null;
}

export async function fetchStreamPlaylist(
  vodId: string,
  fetcher: typeof fetch = fetch,
): Promise<StreamPlaylist | null> {
  const response = await fetcher(`http://website-backend.noway.gg/playlist/stream/${encodeURIComponent(vodId)}`);
  if (!response.ok) {
    throw new Error(`Failed to load playlist: ${response.status} ${response.statusText}`);
  }

  // The backend responds with 200 and no body when no playlist exists.
  const body = await response.text();
  return body.trim() ? JSON.parse(body) as StreamPlaylist | null : null;
}
