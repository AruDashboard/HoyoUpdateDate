const button = document.querySelector<HTMLButtonElement>('#back-to-top');

function updateVisibility() {
  if (button) button.hidden = window.scrollY < 300;
}

button?.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
  document.querySelector<HTMLAnchorElement>('header a')?.focus({ preventScroll: true });
});

window.addEventListener('scroll', updateVisibility, { passive: true });
updateVisibility();
