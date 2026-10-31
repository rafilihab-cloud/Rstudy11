import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DraggableScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
  showArrows?: boolean;
  showFades?: boolean;
  fadeColor?: 'white' | 'slate' | 'transparent';
  arrowSize?: 'sm' | 'md';
}

export const DraggableScrollContainer: React.FC<DraggableScrollContainerProps> = ({
  children,
  className = '',
  wrapperClassName = '',
  showArrows = true,
  showFades = true,
  fadeColor = 'white',
  arrowSize = 'sm',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Mouse drag tracking refs
  const isMouseDownRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const blockClickRef = useRef(false);

  // Check scroll boundary to show/hide arrows and fade hints
  const checkBounds = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 2) {
      setHasOverflow(false);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    setHasOverflow(true);
    const isRtl = document.documentElement.dir === 'rtl' || document.dir === 'rtl';

    if (isRtl) {
      const absScroll = Math.abs(scrollLeft);
      setCanScrollLeft(absScroll < maxScroll - 4);
      setCanScrollRight(absScroll > 4);
    } else {
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < maxScroll - 4);
    }
  }, []);

  useEffect(() => {
    checkBounds();
    const el = scrollRef.current;
    if (!el) return;

    const handleResize = () => checkBounds();
    window.addEventListener('resize', handleResize);
    el.addEventListener('scroll', checkBounds, { passive: true });

    // Native Wheel event to allow effortless horizontal scrolling with mouse wheel
    const handleNativeWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;

      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
        e.preventDefault();
        const isRtl = document.documentElement.dir === 'rtl' || document.dir === 'rtl';
        const scrollStep = e.deltaY > 0 ? 120 : -120;
        el.scrollLeft += isRtl ? -scrollStep : scrollStep;
        checkBounds();
      }
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });

    const resizeObserver = new ResizeObserver(() => checkBounds());
    resizeObserver.observe(el);
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }

    const t1 = setTimeout(checkBounds, 80);
    const t2 = setTimeout(checkBounds, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      el.removeEventListener('scroll', checkBounds);
      el.removeEventListener('wheel', handleNativeWheel);
      resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [checkBounds]);

  // Click & Drag Handler: only activates drag when mouse moves > 7px, never swallows clicks
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !scrollRef.current) return;

    isMouseDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
    blockClickRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current || !scrollRef.current) return;

    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startXRef.current;

    // Only activate drag mode if cursor moved more than 7 pixels
    if (Math.abs(walk) > 7) {
      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        setIsDragging(true);
        blockClickRef.current = true;
      }
      scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
      checkBounds();
    }
  };

  const handleMouseUpOrLeave = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      if (isDraggingRef.current) {
        setIsDragging(false);
        setTimeout(() => {
          isDraggingRef.current = false;
          blockClickRef.current = false;
        }, 80);
      } else {
        isDraggingRef.current = false;
        blockClickRef.current = false;
      }
    }
  };

  // Block clicks ONLY when the user performed an actual drag gesture
  const handleClickCapture = (e: React.MouseEvent) => {
    if (blockClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const scrollHorizontally = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const step = 240;
    const offset = direction === 'left' ? -step : step;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkBounds, 180);
    setTimeout(checkBounds, 360);
  };

  const fadeGradientLeft =
    fadeColor === 'slate'
      ? 'from-slate-100 via-slate-100/70 to-transparent'
      : fadeColor === 'transparent'
      ? 'from-transparent to-transparent'
      : 'from-white via-white/80 to-transparent';

  const fadeGradientRight =
    fadeColor === 'slate'
      ? 'from-slate-100 via-slate-100/70 to-transparent'
      : fadeColor === 'transparent'
      ? 'from-transparent to-transparent'
      : 'from-white via-white/80 to-transparent';

  const btnDimension = arrowSize === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const iconDimension = arrowSize === 'sm' ? 'w-4 h-4' : 'w-4.5 h-4.5';

  return (
    <div className={`relative group/scroll ${wrapperClassName}`}>
      {/* Left Navigation Arrow */}
      {showArrows && hasOverflow && canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollHorizontally('left')}
          className={`flex absolute left-0.5 top-1/2 -translate-y-1/2 z-20 ${btnDimension} rounded-full bg-white/95 text-slate-800 shadow-md border border-slate-200/90 items-center justify-center hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95 cursor-pointer backdrop-blur-xs`}
          title="تمرير لليسار (Scroll Left)"
          aria-label="Scroll left"
        >
          <ChevronLeft className={iconDimension} />
        </button>
      )}

      {/* Left Edge Fade Mask */}
      {showFades && hasOverflow && canScrollLeft && (
        <div
          className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r ${fadeGradientLeft} z-10 rounded-l-xl transition-opacity`}
        />
      )}

      {/* Main Draggable Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onClickCapture={handleClickCapture}
        className={`overflow-x-auto touch-pan-x transition-colors draggable-scroll-container ${
          isDragging ? 'cursor-grabbing select-none' : 'cursor-default'
        } ${className}`}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>

      {/* Right Edge Fade Mask */}
      {showFades && hasOverflow && canScrollRight && (
        <div
          className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l ${fadeGradientRight} z-10 rounded-r-xl transition-opacity`}
        />
      )}

      {/* Right Navigation Arrow */}
      {showArrows && hasOverflow && canScrollRight && (
        <button
          type="button"
          onClick={() => scrollHorizontally('right')}
          className={`flex absolute right-0.5 top-1/2 -translate-y-1/2 z-20 ${btnDimension} rounded-full bg-white/95 text-slate-800 shadow-md border border-slate-200/90 items-center justify-center hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95 cursor-pointer backdrop-blur-xs`}
          title="تمرير لليمين (Scroll Right)"
          aria-label="Scroll right"
        >
          <ChevronRight className={iconDimension} />
        </button>
      )}
    </div>
  );
};
