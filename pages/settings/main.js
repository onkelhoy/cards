import {debounce} from "utils";

const players = {};
const settings = {};

let selected = 'me';

window.onload = () => {
  document.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", handleclick);
  });

  document.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", handlesubmit);
  });

  document.querySelector('select[name="player"]').addEventListener('change', handleplayerselect);
  document.querySelector('input[name="display-name"]').addEventListener('input', handledisplaynamechange);

  const gametype = window.sessionStorage.getItem("game-type");
  document.querySelector("h1#title").innerHTML = `Cards ~ ${gametype}`;

  const displayname = window.localStorage.getItem("display-name");
  if (displayname)
  {
    updatedisplayname(displayname);
    document.querySelector('input[name="display-name"]').value = displayname;
  }
}

function handleclick (e) {
  const value = e.target.getAttribute("data-value");
  const current = document.querySelector("section.selected");

  switch (value) {
    case "join":
    case "create":
      const next = document.querySelector(`section#${value}`);
      current.classList.remove("selected");
      next.classList.add("selected");
      break;
    case "back":
      const joincreate = document.querySelector('section#join-create');
      current.classList.remove("selected");
      joincreate.classList.add("selected");
      break;
    case "lobby":
      const lobby = document.querySelector('section#lobby');
      current.classList.remove("selected");
      lobby.classList.add("selected");
      break;
  }
}

function handlesubmit(e) {
  e.preventDefault();
  const formdata = new FormData(e.target);
  switch (e.target.id) {
    case "create":
      create(formdata);
      break;
    case "display-name":
      updatedisplayname(formdata);
      break;
  }
}
function handleplayerselect(e) {
  selected = e.target.value;
  const option = document.querySelector(`option[value="${selected}"]`);
  if (option)
  {
    document.querySelector('input[name="display-name"]').value = option.innerHTML;
  }
}
const handledisplaynamechange = debounce(e => {
  updatedisplayname(e.target.value);
  
  if (selected === "me")
  {
    if (settings.online)
    {
      // notify rest
    }
  }
})

// helper functions 
function create(formdata) {
  settings.decks = Number(formdata.get("decks"));
  settings.players = Number(formdata.get("players"));
  settings.online = formdata.get("online");

  selected = 'me';

  window.sessionStorage.setItem("settings", JSON.stringify(settings));

  if (settings.online)
  {
    document.querySelector("div.field.players").style.display = "none";
  }
  else 
  {
    const select = document.querySelector("select[name=player]");
    const list = document.querySelector("ul");
    list.innerHTML = `<li data-id="me">${window.localStorage.getItem("display-name")||"me"}</li>`
    for (let i=0; i<(settings.players-1); i++)
    {
      const id = i + 1;
      const name = "Player " + id;

      const li = document.createElement("li");
      li.innerHTML = name;
      li.setAttribute('data-id', id);
      list.appendChild(li);

      const option = document.createElement("option");
      option.value = id;
      option.innerHTML = name;
      select.appendChild(option);
    }
  }
}
function updatedisplayname(displayname) {
  if (selected === "me")
  {
    window.localStorage.setItem("display-name", displayname);
  }

  document.querySelector(`li[data-id="${selected}"]`).innerHTML = displayname;
  document.querySelector(`option[value="${selected}"]`).innerHTML = displayname;

  const players = JSON.parse(window.sessionStorage.getItem("players") || '{}');
  players[selected] = displayname;
  
  window.sessionStorage.setItem("players", JSON.stringify(players));
}