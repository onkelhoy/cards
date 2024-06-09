export function getlink(url) {
  if (url.startsWith('/'))
  {
    if (window.location.hostname.endsWith('github.io'))
    {
      return "/" + window.location.pathname.split("/")[1] + url;
    }
  }

  return url;
}