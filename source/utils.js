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

let logelement = null;
export function logscreen(...strings) {
  if (!logelement)
  {
    logelement = document.createElement("ol");
    logelement.style.position = "fixed";
    logelement.style.pointerEvents = "none";
    logelement.style.top = "0";
    logelement.style.right = "0";
    logelement.style.background = "rgba(0,0,0,0.2)";
    logelement.style.color = "white";
    logelement.style.padding = "1rem";

    document.documentElement.appendChild(logelement);
  }
  
  if (logelement.children.length > 6)
  {
    logelement.removeChild(logelement.firstChild);
  }

  const li = document.createElement("li");
  li.innerHTML = strings.map(o => {
    if (typeof o === "object") return JSON.stringify(o);
    return o;
  }).join(" ");
  
  logelement.appendChild(li);
}

export function debounce(callback, timeout=100) {
  let timer = null;

  return function (...args) {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      callback.apply(this, args)
      timer = null;
    }, timeout);
  }
}