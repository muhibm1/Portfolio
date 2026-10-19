// Applies the visitor's saved light or dark choice to <html> before the first paint, so a saved
// choice never flashes the other theme. Loaded by a plain script tag with a src attribute (the
// site's security policy allows no inline script). Only the two exact values are accepted.
try {
  var saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-theme', saved);
} catch (error) {
  // Storage is refused or empty: follow the system setting.
}
