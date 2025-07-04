import React from 'react';
import GeneralObserver from './GeneralObserver';

interface SpotifyProps {
  spotifyLink?: string;
  width?: string;
  height?: string;
  disableObserver?: boolean;
  iframeStyles?: React.CSSProperties;
}

const Spotify: React.FC<SpotifyProps> = ({
  spotifyLink = '',
  width = '100%',
  height = '152px',
  disableObserver = false,
  iframeStyles,
}) => {
  const defaultStyles: React.CSSProperties = {
    borderRadius: '0.8rem',
    height: height,
    width: width,
  };

  return (
    <GeneralObserver disableObserver={disableObserver}>
      <iframe
        data-testid="spotify"
        title={`spotify-${spotifyLink}`}
        className="spotify-sveltekit-embed"
        src={`https://open.spotify.com/embed/${spotifyLink}`}
        frameBorder="0"
        allow="encrypted-media"
        style={iframeStyles || defaultStyles}
      />
    </GeneralObserver>
  );
};

export default Spotify;
