import React, { useEffect, useRef, useState } from 'react';

interface GeneralObserverProps {
  threshold?: number;
  disableObserver?: boolean;
  children: React.ReactNode;
}

const GeneralObserver: React.FC<GeneralObserverProps> = ({ 
  threshold = 0.5, 
  disableObserver = false, 
  children 
}) => {
  const [loaded, setLoaded] = useState(disableObserver);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasIntersectionObserver = typeof IntersectionObserver !== 'undefined';
    
    if (!hasIntersectionObserver || disableObserver) {
      setLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= threshold) {
            setLoaded(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '0px',
        threshold,
      }
    );

    if (rootRef.current) {
      observer.observe(rootRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, disableObserver]);

  return (
    <div ref={rootRef} data-testid="general-observer">
      {loaded && (
        <div className="transition-opacity duration-300 opacity-100">
          {children}
        </div>
      )}
    </div>
  );
};

export default GeneralObserver;
