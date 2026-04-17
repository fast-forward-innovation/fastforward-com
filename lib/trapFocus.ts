export function trapFocus(focusableSelectors: string, focusGroup: HTMLElement) {
  const focusable = focusGroup.querySelectorAll<HTMLElement>(focusableSelectors);
  if (focusable.length === 0) return () => {};
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== "Tab") return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }

  document.addEventListener("keydown", onKeyDown);
  first.focus();

  return () => document.removeEventListener("keydown", onKeyDown);
}
