'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { cn } from '../../lib/utils';

const CurvedLoop = ({
  marqueeText = '',
  speed = 2,
  className,
  curveAmount = 400,
  direction = 'left',
  interactive = true,
}) => {
  const text = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(marqueeText);
    return (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + '\u00A0';
  }, [marqueeText]);

  const measureRef = useRef(null);
  const textPathRef = useRef(null);
  const pathRef = useRef(null);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);
  const uid = useId();
  const pathId = `curve-${uid}`;
  const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;

  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef(direction);
  const velRef = useRef(0);

  const textLength = spacing || 100;
  const copies = Math.min(20, Math.ceil(4000 / textLength) + 4);
  const totalText = textLength
    ? Array(copies)
        .fill(text)
        .join('')
    : text;
  const ready = true;

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handle = () => setPrefersReducedMotion(mql.matches);
    handle();
    if (mql.addEventListener) mql.addEventListener('change', handle);
    else mql.addListener(handle);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handle);
      else mql.removeListener(handle);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handle = () => setIsMobile(window.innerWidth < 768);
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  useEffect(() => {
    const updateSpacing = () => {
      if (measureRef.current) {
        const length = measureRef.current.getComputedTextLength();
        if (length > 0) setSpacing(length);
      }
    };
    updateSpacing();
    const timeout = setTimeout(updateSpacing, 500); // Check again after font loads
    return () => clearTimeout(timeout);
  }, [text, className]);

  useEffect(() => {
    if (!spacing) return;
    if (textPathRef.current) {
      const initial = -spacing;
      textPathRef.current.setAttribute('startOffset', initial + 'px');
      setOffset(initial);
    }
  }, [spacing]);

  useEffect(() => {
    if (!spacing || !ready) return undefined;
    if (prefersReducedMotion || isMobile) return undefined;

    let frame = 0;
    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = dirRef.current === 'right' ? speed : -speed;
        const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
        let newOffset = currentOffset + delta;
        const wrapPoint = spacing;
        if (newOffset <= -wrapPoint) newOffset += wrapPoint;
        if (newOffset > 0) newOffset -= wrapPoint;
        textPathRef.current.setAttribute('startOffset', newOffset + 'px');
        setOffset(newOffset);
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spacing, speed, ready, prefersReducedMotion, isMobile]);

  const onPointerDown = (e) => {
    if (!interactive || prefersReducedMotion || isMobile) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch {}
  };

  const onPointerMove = (e) => {
    if (!interactive || !dragRef.current || !textPathRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;
    const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
    let newOffset = currentOffset + dx;
    const wrapPoint = spacing;
    if (newOffset <= -wrapPoint) newOffset += wrapPoint;
    if (newOffset > 0) newOffset -= wrapPoint;
    textPathRef.current.setAttribute('startOffset', newOffset + 'px');
    setOffset(newOffset);
  };

  const endDrag = () => {
    if (!interactive) return;
    dragRef.current = false;
    dirRef.current = velRef.current > 0 ? 'right' : 'left';
  };

  const showAnimation = !prefersReducedMotion && !isMobile;
  const cursorStyle = interactive && showAnimation ? (dragRef.current ? 'grabbing' : 'grab') : 'auto';

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden flex items-center justify-center',
        'pt-12 pb-40 md:pt-24 md:pb-64',
        className
      )}
      style={{
        cursor: cursorStyle,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      aria-hidden={!showAnimation}
    >
      <p className="sr-only">
        {marqueeText.split(/[•✦✨]/).map((s) => s.trim()).filter(Boolean).join(', ')}
      </p>

      <svg
        className="select-none w-full overflow-visible block aspect-[100/12] text-[3rem] sm:text-[4.5rem] md:text-[6rem] font-bold uppercase leading-none"
        viewBox="0 0 1440 120"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
        aria-hidden="true"
      >
        <defs>
          <path
            ref={pathRef}
            id={pathId}
            d={pathD}
            fill="none"
            stroke="transparent"
          />
        </defs>

        <text
          ref={measureRef}
          xmlSpace="preserve"
          style={{ opacity: 0, pointerEvents: 'none' }}
        >
          {text}
        </text>

        {ready && (
          <text
            xmlSpace="preserve"
            className={cn("fill-white", className)}
          >
            <textPath
              ref={textPathRef}
              href={`#${pathId}`}
              startOffset={(offset || 0) + 'px'}
              xmlSpace="preserve"
            >
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
};

export default CurvedLoop;