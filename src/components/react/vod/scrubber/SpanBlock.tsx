import React from 'react';
import type { ViewportState } from './types';
import { toPercent, isVisible } from './types';

interface SpanBlockProps {
  startSeconds: number;
  endSeconds: number;
  viewport: ViewportState;
  label: string;
  sublabel?: string;
  color: string;
  borderColor?: string;
  onClick?: () => void;
  tooltip?: string;
  imageUrl?: string;
}

const SpanBlock: React.FC<SpanBlockProps> = ({
  startSeconds,
  endSeconds,
  viewport,
  label,
  sublabel,
  color,
  borderColor = 'border-white/10',
  onClick,
  tooltip,
  imageUrl,
}) => {
  if (!isVisible(startSeconds, endSeconds, viewport)) {
    return null;
  }

  // Calculate left and width percentages
  const rawLeft = toPercent(startSeconds, viewport);
  const rawEnd = toPercent(endSeconds, viewport);
  
  // Clamp percentages to viewport bounds
  const left = Math.max(0, rawLeft);
  const right = Math.min(100, rawEnd);
  const width = Math.max(0.3, right - left);

  return (
    <div
      onClick={onClick}
      title={tooltip}
      className={`absolute top-1 bottom-1 rounded-xl border px-2 md:px-3 py-1 flex items-center gap-2 md:gap-3 overflow-hidden transition-all select-none duration-150 cursor-pointer hover:brightness-110 active:scale-[0.99] ${color} ${borderColor}`}
      style={{
        left: `${left}%`,
        width: `${width}%`,
        // Prevent parent clipping container from squishing the champion image
        minWidth: imageUrl ? '56px' : '24px',
      }}
    >
      {/* Optional image thumbnail (e.g. champion square portrait) */}
      {imageUrl && width > 0.5 && (
        <img
          src={imageUrl}
          alt={label}
          className="w-10 h-10 rounded-lg border border-white/20 object-cover shrink-0 select-none pointer-events-none shadow-md"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      )}

      <div className="flex flex-col min-w-0 w-full justify-center">
        <span className="text-xs md:text-sm font-extrabold text-white truncate w-full leading-tight">
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] md:text-xs font-semibold text-white/90 truncate w-full mt-0.5 leading-none">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default SpanBlock;
