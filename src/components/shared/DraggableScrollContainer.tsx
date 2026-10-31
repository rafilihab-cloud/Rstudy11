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
    const maxScroll = Math.max(0, scrollWidth - clientWidth);

    if (maxScroll <= 2) {
      setHasOverflow(false);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    setHasOverflow(true);
    const isRtl = document.documentElement.dir === 'rtl' || document.dir === 'rtl';

    if (isRtl) {
      // In RTL, scrollLeft is either negative (0 to -maxScroll) or positive (0 to maxScroll) depending on engine
      const absScroll = Math.abs(scrollLeft);
      // Can scroll left means we have not reached the left edge yet
      setCanScrollLeft(absScroll < maxScroll - 3);
      // Can scroll right means we have moved away from the right edge
      setCanScrollRight(absScroll > 3);
    } else {
      setCanScrollLeft(scrollLeft > 3);
      setCanScrollRight(scrollLeft < maxScroll - 3);
    }
  }, []);

  useEffect(() => {
    checkBounds();
    const el = scrollRef.current;
    if (!el) return;

    const handleResize = () => checkBounds();
    window.addEventListener('resize', handleResize);
    el.addEventListener('scroll', checkBounds, { passive: true });

    // Enable smooth horizontal scrolling with mouse wheel over the strip
    const handleNativeWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;

      // Handle vertical wheel delta converted to horizontal scroll
      if (Math.abs(e.deltaY) > 0 && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        e.preventDefault();
        const isRtl = document.documentElement.dir === 'rtl' || document.dir === 'rtl';
        // In RTL, scrolling wheel down should move left (towards hidden items)
        const scrollDelta = e.deltaY > 0 ? 140 : -140;
        el.scrollLeft += isRtl ? -scrollDelta : scrollDelta;
        checkBounds();
      }
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });

    const resizeObserver = new ResizeObserver(() => checkBounds());
    resizeObserver.observe(el);
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }

    const t1 = setTimeout(checkBounds, 60);
    const t2 = setTimeout(checkBounds, 250);
    const t3 = setTimeout(checkBounds, 600);

    return () => {
      window.removeEventListener('resize', handleResize);
      el.removeEventListener('scroll', checkBounds);
      el.removeEventListener('wheel', handleNativeWheel);
      resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [checkBounds]);

  // Robust Global Mouse Dragging for PC:
  // When mouse is pressed down on the container, we listen to window mousemove and mouseup!
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only primary mouse button
    if (e.button !== 0 || !scrollRef.current) return;

    isMouseDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
    blockClickRef.current = false;

    const onGlobalMouseMove = (moveEvent: MouseEvent) => {
      if (!isMouseDownRef.current || !scrollRef.current) return;

      const deltaX = moveEvent.clientX - startXRef.current;

      // Once moved beyond 4px, engage drag mode
      if (Math.abs(deltaX) > 4) {
        if (!isDraggingRef.current) {
          isDraggingRef.current = true;
          setIsDragging(true);
          blockClickRef.current = true;
          document.body.style.userSelect = 'none';
        }

        // Scroll follows the drag naturally
        scrollRef.current.scrollLeft = scrollLeftRef.current - deltaX;
        checkBounds();
      }
    };

    const onGlobalMouseUp = () => {
      isMouseDownRef.current = false;
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);

      if (isDraggingRef.current) {
        setIsDragging(false);
        setTimeout(() => {
          isDraggingRef.current = false;
          blockClickRef.current = false;
        }, 100);
      } else {
        isDraggingRef.current = false;
        blockClickRef.current = false;
      }
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
  };

  // Block clicks on inner buttons ONLY if user performed a genuine drag
  const handleClickCapture = (e: React.MouseEvent) => {
    if (blockClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Manual smooth scroll by arrow buttons
  const scrollHorizontally = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    const isRtl = document.documentElement.dir === 'rtl' || document.dir === 'rtl';
    const step = 260;

    if (direction === 'left') {
      // In RTL, moving left means moving further into negative scrollLeft
      if (isRtl) {
        el.scrollBy({ left: -step, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -step, behavior: 'smooth' });
      }
    } else {
      // Moving right
      if (isRtl) {
        el.scrollBy({ left: step, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    }

    setTimeout(checkBounds, 120);
    setTimeout(checkBounds, 320);
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

  const btnDimension = arrowSize === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const iconDimension = arrowSize === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className={`relative group/scroll ${wrapperClassName}`}>
      {/* Left Navigation Arrow (Always accessible on PC when overflow left is available) */}
      {showArrows && hasOverflow && canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollHorizontally('left')}
          className={`flex absolute left-0.5 top-1/2 -translate-y-1/2 z-30 ${btnDimension} rounded-full bg-white text-slate-800 shadow-md hover:shadow-lg border border-slate-300 items-center justify-center hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-90 cursor-pointer`}
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
        onClickCapture={handleClickCapture}
        className={`overflow-x-auto touch-pan-x transition-colors draggable-scroll-container ${
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
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

      {/* Right Navigation Arrow (Always accessible on PC when overflow right is available) */}
      {showArrows && hasOverflow && canScrollRight && (
        <button
          type="button"
          onClick={() => scrollHorizontally('right')}
          className={`flex absolute right-0.5 top-1/2 -translate-y-1/2 z-30 ${btnDimension} rounded-full bg-white text-slate-800 shadow-md border hover:shadow-lg border-slate-300 items-center justify-center hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-90 cursor-pointer`}
          title="تمرير لليمين (Scroll Right)"
          aria-label="Scroll right"
        >
          <ChevronRight className={iconDimension} />
        </button>
      )}
    </div>
  );
};
