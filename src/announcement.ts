const DISPLAY_DURATION = 5000;
const FADE_DURATION = 500;

export function showAnnouncement(text: string): void {
  // Remove any existing announcement
  document.getElementById("monologue-announcement")?.remove();

  const el = document.createElement("div");
  el.id = "monologue-announcement";
  el.textContent = text;

  document.body.appendChild(el);

  // Force layout flush, then add visible class to trigger CSS transition
  void el.offsetHeight;
  el.classList.add("monologue-announcement--visible");

  // Fade out and remove
  setTimeout(() => {
    el.classList.remove("monologue-announcement--visible");
    setTimeout(() => el.remove(), FADE_DURATION);
  }, DISPLAY_DURATION);
}
