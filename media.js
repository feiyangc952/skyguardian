for (const link of document.querySelectorAll('.video-play')) {
  const frame = link.parentElement;
  const player = frame.querySelector('video');
  const poster = frame.querySelector('img');

  link.addEventListener('click', async (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (link.hasAttribute('aria-busy')) return;

    link.setAttribute('aria-busy', 'true');
    link.textContent = 'Loading video…';

    try {
      // A local Blob lets the player seek even when the static host ignores Range requests.
      const response = await fetch(link.href);
      if (!response.ok) throw new Error(`Video request failed (${response.status})`);
      const videoUrl = URL.createObjectURL(await response.blob());
      player.addEventListener('error', () => {
        URL.revokeObjectURL(videoUrl);
        player.hidden = true;
        poster.hidden = false;
        link.hidden = false;
        link.textContent = 'Retry video';
        if (document.activeElement === player) link.focus({ preventScroll: true });
      }, { once: true });

      const moveFocus = document.activeElement === link;
      player.src = videoUrl;
      player.controls = true;
      player.hidden = false;
      poster.hidden = true;
      link.hidden = true;
      if (moveFocus) player.focus({ preventScroll: true });
      player.play().catch(() => {
        // Browsers that require a fresh gesture after loading can use the native play control.
      });
    } catch {
      link.textContent = 'Retry video';
    } finally {
      link.removeAttribute('aria-busy');
    }
  });
}
