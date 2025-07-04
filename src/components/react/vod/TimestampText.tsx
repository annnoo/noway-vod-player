import React from 'react';

interface TimestampTextProps {
  offsetSeconds: number;
}

const TimestampText: React.FC<TimestampTextProps> = ({ offsetSeconds }) => {
  const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <span className="font-mono text-sm">
      {formatTimestamp(offsetSeconds)}
    </span>
  );
};

export default TimestampText;
