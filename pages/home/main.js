import { getlink } from "utils";

window.onload = () => {
  document.querySelectorAll('a').forEach(a => {
    a.onclick = (e) => {
      e.preventDefault();
      window.sessionStorage.setItem("link", getlink(e.target.href));
      window.sessionStorage.setItem("game-type", e.target.getAttribute("data-game-type"));

      window.location.href = getlink("/pages/lobby/index.html");
    }
  })
}