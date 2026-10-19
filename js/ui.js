import {
  data, attempt, recall, remember, fill, size, civsOf, preferredLanguage, loadLanguage, fetchUpdate,
  words, tag, collator, numbers, useLanguage, nameOf, civName, plural, plain,
} from "./datahandler.js";
import {
  items, roots, include, matching, setIncluded, rebuild, setMark, state, mark, fit, filtersOf, unmarkLine, share, chipName, chainOf,
} from "./model.js";

export const $ = (id) => document.getElementById(id);
export const clone = (id) => $(id).content.firstElementChild.cloneNode(true);
const compose = (node, template, values) => node.replaceChildren(...template.split(/(\{\w+\})/).filter(Boolean)
  .map((part) => (/^\{\w+\}$/.test(part) && part.slice(1, -1) in values ? values[part.slice(1, -1)] : part)));

function plant() {
  const open = new Set(items.filter(isOpen).map((item) => item.path));
  endPress();
  found = [];
  rebuild();
  $("tree").replaceChildren();
  build(roots, $("tree"));
  for (const item of items) if (open.has(item.path)) setOpen(item, true);
}
function build(list, ul) {
  for (const item of list) {
    const li = clone("itemTemplate");
    const twisty = li.querySelector(".twisty");
    const kids = li.querySelector("ul");
    item.node = li.querySelector(".node");
    item.label = li.querySelector(".name");
    item.lacking = li.querySelector(".lacking");
    item.count = li.querySelector(".count");
    item.civCount = li.querySelector(".civ-count");
    item.node.dataset.i = item.i;
    item.node.classList.toggle("group", item.group);
    item.label.id = `t${item.i}`;
    if (item.kids.length) {
      li.querySelector(".gap").remove();
      item.twisty = twisty;
      twisty.dataset.i = item.i;
      twisty.setAttribute("aria-controls", `k${item.i}`);
      twisty.setAttribute("aria-labelledby", `t${item.i}`);
      item.list = kids;
      kids.id = `k${item.i}`;
      build(item.kids, kids);
    } else {
      twisty.remove();
      kids.remove();
    }
    ul.append(li);
  }
}

export const isOpen = (item) => item.twisty?.getAttribute("aria-expanded") === "true";
export function setOpen(item, open) {
  if (!item.twisty) return;
  item.twisty.setAttribute("aria-expanded", String(open));
  item.list.hidden = !open;
  count(item);
}
function count(item) {
  const own = size(matching & (item.group ? item.all : item.set));
  const all = size(matching & item.all);
  if (item.group || !item.kids.length || isOpen(item)) {
    item.count.textContent = numbers.format(own);
    item.civCount.textContent = plural("civCount", own);
    return;
  }
  compose(item.count, words.ui.range, { own: numbers.format(own), all: numbers.format(all) });
  item.civCount.textContent = fill(words.ui.civRange, { own: plural("civCount", own), all: plural("civCount", all) });
}
const expand = (item) => chainOf(item).forEach((each) => setOpen(each, true));
export const shown = (item) => !item.parent || (isOpen(item.parent) && shown(item.parent));

function toggle(item, kind) {
  mark(item, kind);
  update();
}
function paint() {
  for (const item of items) {
    const s = state(item);
    item.node.dataset.state = s || "";
    item.node.setAttribute("aria-checked", s === "has" ? "true" : s === "mixed" ? "mixed" : "false");
    item.lacking.textContent = s === "lacks" ? words.ui.lacking : "";
    item.node.classList.toggle("self", !!item.self);
  }
}
function update() {
  const marked = fit();
  paint();
  const civs = marked.length ? civsOf(matching) : [];
  $("count").textContent = plural("compatible", civs.length);
  $("civs").replaceChildren(...civs.map(civName).sort(collator.compare).map((name) => {
    const li = clone("civTemplate");
    li.textContent = name;
    return li;
  }));
  $("none").hidden = civs.length > 0;
  $("none").textContent = marked.length ? words.ui.noMatch : words.ui.start;
  items.forEach(count);
  const filters = filtersOf();
  $("ticked").hidden = !filters.length;
  $("chips").replaceChildren(...filters.map(({ item, mark: kind }) => {
    const li = clone("chipTemplate");
    const chip = li.querySelector(".chip");
    const name = chipName(item, kind);
    chip.dataset.i = item.i;
    chip.dataset.state = kind;
    li.querySelector(".chip-label").textContent = fill(words.ui[kind === "has" ? "clearHas" : "clearLacks"], { name });
    li.querySelector(".chip-name").textContent = name;
    return li;
  }));
}

let found = [];
function find() {
  const text = plain($("find").value);
  found = text ? items.filter((item) => plain(nameOf(item)).includes(text)) : [];
  for (const item of items) item.node.classList.toggle("found", found.includes(item));
  $("found").textContent = !text ? "" : found.length ? plural("found", found.length) : words.ui.noneFound;
  if (!found.length) return;
  const open = new Set();
  for (const item of found) for (let p = item.parent; p; p = p.parent) open.add(p);
  for (const item of items) setOpen(item, open.has(item));
  found[0].node.scrollIntoView({ block: "nearest" });
}

const itemAt = (target) => items[target.closest?.(".node")?.dataset.i];
let press = null;
let touchEnded = -Infinity;
let swallowClick = false;
const endPress = () => {
  if (!press) return;
  clearTimeout(press.timer);
  press.item.node.classList.remove("pressed");
  if (press.timer) touchEnded = performance.now();
  press = null;
};

function wireTree() {
  const tree = $("tree");
  tree.addEventListener("keydown", (e) => {
    const item = items[e.target.dataset.i];
    if (!item || e.altKey || e.ctrlKey || e.metaKey) return;
    const kind = e.target === item.node && { " ": "has", x: "lacks", X: "lacks" }[e.key];
    if (kind) {
      e.preventDefault();
      toggle(item, kind);
      return;
    }
    if (e.shiftKey) return;
    const rows = items.filter(shown);
    const at = rows.indexOf(item);
    let to = null;
    if (e.key === "ArrowDown") to = rows[at + 1];
    else if (e.key === "ArrowUp") to = rows[at - 1];
    else if (e.key === "Home") to = rows[0];
    else if (e.key === "End") to = rows[rows.length - 1];
    else if (e.key === "ArrowRight") isOpen(item) ? (to = item.kids[0]) : expand(item);
    else if (e.key === "ArrowLeft") isOpen(item) ? setOpen(item, false) : (to = item.parent);
    else return;
    e.preventDefault();
    if (to) (e.target === item.twisty && to.twisty ? to.twisty : to.node).focus();
  });
  tree.addEventListener("pointerdown", (e) => {
    swallowClick = false;
    endPress();
    const item = itemAt(e.target);
    if (!item || (e.button !== 2 && e.pointerType !== "touch")) return;
    press = { item, id: e.pointerId, x: e.clientX, y: e.clientY, ready: e.button === 2 };
    if (!press.ready) {
      press.timer = setTimeout(() => {
        press.ready = true;
        item.node.classList.add("pressed");
      }, 500);
    }
  });
  tree.addEventListener("pointermove", (e) => {
    if (press && e.pointerId === press.id && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) endPress();
  });
  tree.addEventListener("pointerup", (e) => {
    if (!press || e.pointerId !== press.id) return;
    const { item, ready } = press;
    endPress();
    if (ready && itemAt(e.target) === item) {
      toggle(item, "lacks");
      swallowClick = true;
    }
  });
  tree.addEventListener("pointercancel", endPress);
  tree.addEventListener("contextmenu", (e) => {
    const item = itemAt(e.target);
    if (!item) return;
    e.preventDefault();
    if (e.button === 2 || press || performance.now() - touchEnded < 600) return;
    toggle(item, "lacks");
  });
  tree.addEventListener("click", (e) => {
    const twisty = e.target.closest(".twisty");
    if (twisty) return isOpen(items[twisty.dataset.i]) ? setOpen(items[twisty.dataset.i], false) : expand(items[twisty.dataset.i]);
    const item = itemAt(e.target);
    if (!item || swallowClick) return;
    toggle(item, "has");
  });
  $("expandAll").addEventListener("click", () => items.forEach((item) => setOpen(item, true)));
  $("collapseAll").addEventListener("click", () => items.forEach((item) => setOpen(item, false)));
  $("clear").addEventListener("click", () => {
    roots.forEach((item) => setMark(item, null));
    update();
  });
  $("find").addEventListener("input", find);
  $("find").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && found.length) found[0].node.focus();
  });
  $("chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const at = [...$("chips").querySelectorAll(".chip")].indexOf(chip);
    unmarkLine(items[chip.dataset.i], chip.dataset.state);
    update();
    const chips = $("chips").querySelectorAll(".chip");
    (chips[at] || chips[at - 1] || $("civTitle")).focus();
  });
}

export const options = () => [...$("languageList").querySelectorAll("[data-language]")];
export function setMenu(open, focus) {
  $("languageButton").setAttribute("aria-expanded", String(open));
  $("languageList").hidden = !open;
  $("settings").hidden = open;
  focus?.focus();
}
function buildLanguages() {
  $("languageList").replaceChildren(...Object.entries(data.languages).map(([code, { name, tag: languageTag }]) => {
    const li = clone("languageTemplate");
    const option = li.querySelector("button");
    option.dataset.language = code;
    option.lang = languageTag;
    option.textContent = name;
    return li;
  }));
}
export function setLanguage(code) {
  useLanguage(code);
  document.documentElement.lang = tag;
  for (const node of document.querySelectorAll("[data-text]")) node.textContent = words.ui[node.dataset.text];
  $("languageName").textContent = data.languages[code].name;
  for (const option of options()) option.setAttribute("aria-current", String(option.dataset.language === code));
  label();
  const [year, month] = data.source.updated.split("-").map(Number);
  $("sourceLink").href = data.source.url;
  $("sourceLink").textContent = data.source.name;
  compose($("source"), words.ui.source, {
    source: $("sourceLink"),
    date: new Intl.DateTimeFormat(tag, { year: "numeric", month: "long" }).format(new Date(year, month - 1)),
  });
  update();
  if ($("find").value) find();
}
function label() {
  for (const item of items) item.label.textContent = nameOf(item);
  share();
}
function showInclude() {
  $("include").setAttribute("aria-checked", String(include));
  $("include").dataset.state = include ? "has" : "";
}
export function setInclude(on) {
  setIncluded(on);
  remember("include", String(on));
  showInclude();
  plant();
  label();
  update();
  if ($("find").value) find();
}
function wireOptions() {
  $("optionsButton").addEventListener("click", () => $("options").showModal());
  $("options").addEventListener("close", () => setMenu(false));
  $("include").addEventListener("click", () => setInclude(!include));
  $("include").addEventListener("keydown", (e) => {
    if (e.key !== " ") return;
    e.preventDefault();
    setInclude(!include);
  });
}
let chosen = null;
function choose(code) {
  chosen = code;
  if (!data.text[code]) {
    loadLanguage(code).then(() => {
      if (chosen === code) choose(code);
    }, () => {
      $("loadError").hidden = false;
    });
    return;
  }
  $("loadError").hidden = true;
  setLanguage(code);
  remember("language", code);
  const search = new URLSearchParams(location.search);
  search.set("lng", code);
  attempt(() => history.replaceState(history.state, "", `?${search}${location.hash}`));
}
function wireLanguages() {
  const picker = $("language");
  const button = $("languageButton");
  button.addEventListener("click", () => setMenu($("languageList").hidden));
  $("languageList").addEventListener("click", (e) => {
    const option = e.target.closest("[data-language]");
    if (!option) return;
    choose(option.dataset.language);
    setMenu(false, button);
  });
  picker.addEventListener("keydown", (e) => {
    const list = options();
    const at = list.indexOf(document.activeElement);
    const open = !$("languageList").hidden;
    let to = null;
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setMenu(false, button);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const current = list.findIndex((option) => option.getAttribute("aria-current") === "true");
      to = at < 0 ? current : (at + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
    } else if (open && e.key === "Home") to = 0;
    else if (open && e.key === "End") to = list.length - 1;
    else return;
    e.preventDefault();
    if (!open) setMenu(true);
    list[to].focus();
  });
  picker.addEventListener("focusout", (e) => {
    if (e.relatedTarget && !picker.contains(e.relatedTarget)) setMenu(false);
  });
  document.addEventListener("pointerdown", (e) => {
    if (!picker.contains(e.target)) setMenu(false);
  });
}

export function openReport(title, status) {
  $("reportTitle").textContent = title;
  $("reportStatus").textContent = status;
  $("reportList").replaceChildren();
  $("reportDownloads").replaceChildren();
  $("reportDownloads").hidden = true;
  if (!$("report").open) $("report").showModal();
}
export function report(line) {
  const li = clone("reportTemplate");
  li.textContent = line;
  $("reportList").append(li);
}
export async function runUpdate() {
  const tools = data.tools;
  openReport(tools.updateTitle, fill(tools.updateLoading, { source: data.source.name }));
  try {
    const { messages, fresh, files } = await fetchUpdate();
    messages.forEach(report);
    if (!fresh) {
      $("reportStatus").textContent = tools.updateBlocked;
      return;
    }
    if (!messages.length) report(tools.updateSame);
    $("reportStatus").textContent = fill(tools.updateReady, {
      civs: fresh.civs.length, items: Object.keys(fresh.availability).length, languages: Object.keys(fresh.languages).length,
    });
    $("reportDownloads").replaceChildren(...files.map(({ path, json }) => {
      const li = clone("downloadTemplate");
      const link = li.querySelector("a");
      link.href = URL.createObjectURL(new Blob([`${json}\n`], { type: "application/json" }));
      link.download = path.split("/").pop();
      link.textContent = fill(tools.download, { file: path });
      return li;
    }));
    $("reportDownloads").hidden = false;
  } catch (error) {
    $("reportStatus").textContent = fill(tools.updateFailed, { error: error.message });
  }
}

export function start() {
  setIncluded(recall("include") === "true");
  showInclude();
  plant();
  buildLanguages();
  for (const node of document.querySelectorAll("[data-tool]")) node.textContent = data.tools[node.dataset.tool];
  wireTree();
  wireLanguages();
  wireOptions();
  const code = preferredLanguage();
  setLanguage(data.text[code] ? code : Object.keys(data.languages)[0]);
  $("top").hidden = false;
  $("content").hidden = false;
}
export function showLoadError() {
  $("loadError").hidden = false;
}
