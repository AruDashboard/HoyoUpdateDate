const toggle = document.querySelector<HTMLButtonElement>('#theme-toggle');

function updateToggle() {
  const dark = document.documentElement.classList.contains('dark');
  toggle?.setAttribute('aria-pressed', String(dark));
}

toggle?.addEventListener('click', () => {
  const dark = document.documentElement.classList.toggle('dark');
  try {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  } catch {}
  updateToggle();
});

updateToggle();
