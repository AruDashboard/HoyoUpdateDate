export function scrollToInitialDate(position: () => void, table: HTMLElement) {
  let active = true;
  let frame = 0;
  let observer: ResizeObserver | undefined;
  const interactionEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;

  function stop() {
    active = false;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    clearTimeout(timeout);
    interactionEvents.forEach((event) => window.removeEventListener(event, stop));
  }

  function schedule() {
    if (!active) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (active) position();
    });
  }

  interactionEvents.forEach((event) =>
    window.addEventListener(event, stop, { passive: true, once: true }),
  );
  const timeout = window.setTimeout(stop, 4000);

  position();
  schedule();
  if ('ResizeObserver' in window) {
    observer = new ResizeObserver(schedule);
    observer.observe(table);
  }

  const loaded = new Promise<void>((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', () => resolve(), { once: true });
  });
  const fontsReady = 'fonts' in document ? document.fonts.ready : Promise.resolve();

  void Promise.allSettled([loaded, fontsReady]).then(() => {
    if (!active) return;
    // Let the browser finish painting and applying any scroll restoration first.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (active) position();
        stop();
      });
    });
  });
}
