export function getlink(url) {
  if (url.startsWith('/'))
  {
    if (window.location.hostname.endsWith('github.io'))
    {
      return window.location.pathname + url.slice(1, url.length);
    }
  }

  return url;
}