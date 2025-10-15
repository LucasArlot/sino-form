export type DropdownDebugOptions = {
  listEl: HTMLElement;
  triggerEl?: HTMLElement | null;
  containerEl?: HTMLElement | null;
  type?: string;
};

function isEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.location.search.includes('dropdownDebug=1')) return true;
    if (localStorage.getItem('dropdownDebug') === '1') return true;
  } catch {
    // ignore storage/access errors
  }
  return false;
}

/**
 * Attach lightweight visual debugging aids for dropdown positioning.
 * Returns a cleanup function; it is a no-op when disabled.
 */
export function attachDropdownDebug(options: DropdownDebugOptions): () => void {
  // Gracefully no-op unless explicitly enabled
  if (!isEnabled()) return () => {};

  const { listEl, triggerEl, containerEl, type } = options;

  const cleanups: Array<() => void> = [];
  let viewportLine: HTMLDivElement | null = null;

  try {
    // Highlight the dropdown list
    listEl.style.outline = '2px dashed #10b981';
    listEl.style.outlineOffset = '2px';
    if (type) listEl.dataset.debugType = type;
    cleanups.push(() => {
      listEl.style.outline = '';
      listEl.style.outlineOffset = '';
      delete listEl.dataset.debugType;
    });

    // Highlight the trigger field
    if (triggerEl) {
      const prevOutline = triggerEl.style.outline;
      triggerEl.style.outline = '2px solid #3b82f6';
      cleanups.push(() => {
        triggerEl.style.outline = prevOutline;
      });
    }

    // Optional container outline
    if (containerEl) {
      const prev = containerEl.style.outline;
      containerEl.style.outline = '1px dashed rgba(0,0,0,0.3)';
      cleanups.push(() => {
        containerEl.style.outline = prev;
      });
    }

    // Visual line showing the effective viewport bottom above the fixed footer
    const updateViewportLine = () => {
      const footerEl = document.querySelector('.form-footer') as HTMLElement | null;
      const bottomOffset = footerEl ? Math.max(0, footerEl.getBoundingClientRect().height) : 0;
      if (!viewportLine) {
        viewportLine = document.createElement('div');
        viewportLine.style.position = 'fixed';
        viewportLine.style.left = '0';
        viewportLine.style.right = '0';
        viewportLine.style.height = '2px';
        viewportLine.style.background = 'rgba(59,130,246,0.5)';
        viewportLine.style.pointerEvents = 'none';
        viewportLine.style.zIndex = '9999';
        document.body.appendChild(viewportLine);
        cleanups.push(() => {
          if (viewportLine && viewportLine.parentNode) viewportLine.parentNode.removeChild(viewportLine);
          viewportLine = null;
        });
      }
      viewportLine.style.bottom = `${bottomOffset}px`;
    };

    const onResizeOrScroll = () => updateViewportLine();
    updateViewportLine();
    window.addEventListener('resize', onResizeOrScroll, { passive: true } as any);
    window.addEventListener('scroll', onResizeOrScroll, { passive: true, capture: true } as any);
    cleanups.push(() => {
      window.removeEventListener('resize', onResizeOrScroll as any);
      window.removeEventListener('scroll', onResizeOrScroll as any, true);
    });
  } catch {
    // If anything fails, ensure we still return a valid cleanup
  }

  return () => {
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore individual cleanup errors
      }
    });
  };
}

export default attachDropdownDebug;


