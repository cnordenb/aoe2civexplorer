"use strict";
(() => {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const LINE_WIDTH = 120;
  const ABBREVIATION = /[\p{L}\p{N}_]\.(\s|$)|\bE-|-\s/u;
  const TAG = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i;

  const attempt = (action) => {
    try {
      return action();
    } catch {
      return null;
    }
  };
  const load = (url) => new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url);
    request.onload = () => (request.status === 200 || (request.status === 0 && request.responseText)
      ? resolve(request.responseText)
      : reject(new Error(`${url} (${request.status})`)));
    request.onerror = () => reject(new Error(url));
    request.send();
  });
  const clone = (id) => $(id).content.firstElementChild.cloneNode(true);
  const fill = (template, values) => template.replace(/\{(\w+)\}/g, (whole, key) => (key in values ? String(values[key]) : whole));
  const compose = (node, template, values) => node.replaceChildren(...template.split(/(\{\w+\})/).filter(Boolean)
    .map((part) => (/^\{\w+\}$/.test(part) && part.slice(1, -1) in values ? values[part.slice(1, -1)] : part)));
  const treeKeys = (nodes, key) => nodes.flatMap((node) => [...(node[key] ? [node[key]] : []), ...treeKeys(node.kids ?? [], key)]);

  let data;
  let language;
  let words;
  let tag;
  let collator;
  let plurals;
  let numbers;
  let shared = new Set();
  let civBit;
  let ALL;
  const items = [];
  const roots = [];

  const bit = (civ) => {
    if (!civBit.has(civ)) throw new Error(`unknown civilisation ${civ}`);
    return civBit.get(civ);
  };
  const size = (set) => {
    let n = 0;
    for (let s = set; s; s &= s - 1n) n++;
    return n;
  };
  const setOf = (rule) => (rule === "all"
    ? ALL
    : rule.has
      ? rule.has.reduce((s, civ) => s | bit(civ), 0n)
      : rule.lacks.reduce((s, civ) => s & ~bit(civ), ALL));
  const civsOf = (set) => data.civs.filter((civ) => set & civBit.get(civ));

  function collect(nodes, parent) {
    for (const node of nodes) {
      if (node.item && !(node.item in data.availability)) throw new Error(`no availability for ${node.item}`);
      const item = {
        i: items.length, key: node.item ?? node.group, group: !node.item, set: node.item ? setOf(data.availability[node.item]) : ALL,
        self: null, kids: [], parent,
      };
      (parent ? parent.kids : roots).push(item);
      items.push(item);
      collect(node.kids ?? [], item);
    }
  }
  const whole = (item) => (item.all ??= item.kids.reduce((s, kid) => s & whole(kid), item.set));

  const nameOf = (item) => (item.group ? words.groups[item.key] : words.items[item.key]) ?? item.key;
  const civName = (civ) => words.civs[civ] ?? civ;
  const plural = (key, n) => {
    const forms = words.ui[key];
    return fill(forms[plurals.select(n)] ?? forms.other, { n: numbers.format(n) });
  };

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

  const isOpen = (item) => item.twisty?.getAttribute("aria-expanded") === "true";
  function setOpen(item, open) {
    if (!item.twisty) return;
    item.twisty.setAttribute("aria-expanded", String(open));
    item.list.hidden = !open;
  }
  const shown = (item) => !item.parent || (isOpen(item.parent) && shown(item.parent));

  function setMark(item, mark) {
    if (!item.group) item.self = mark;
    for (const kid of item.kids) setMark(kid, mark);
  }
  function state(item) {
    const parts = item.kids.map(state);
    if (!item.group) parts.push(item.self);
    return parts.every((part) => part === parts[0]) ? parts[0] : "mixed";
  }
  function toggle(item, mark) {
    setMark(item, state(item) === mark ? null : mark);
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
  const markOf = (item) => (["has", "lacks"].includes(state(item)) ? state(item) : item.self);
  function chipName(item) {
    const name = shared.has(nameOf(item)) && item.parent ? fill(words.ui.inParent, { name: nameOf(item), parent: nameOf(item.parent) }) : nameOf(item);
    return item.kids.length && state(item) === "has" ? fill(words.ui.full, { name }) : name;
  }

  function update() {
    paint();
    const marked = items.filter((item) => item.self);
    const match = marked.reduce((m, item) => m & (item.self === "has" ? item.set : ~item.set), ALL);
    const civs = marked.length ? civsOf(match) : [];
    $("count").textContent = plural("compatible", civs.length);
    $("civs").replaceChildren(...civs.map(civName).sort(collator.compare).map((name) => {
      const li = clone("civTemplate");
      li.textContent = name;
      return li;
    }));
    $("none").hidden = civs.length > 0;
    $("none").textContent = marked.length ? words.ui.noMatch : words.ui.start;
    for (const item of items) {
      const n = size(match & item.all);
      item.count.textContent = numbers.format(n);
      item.civCount.textContent = plural("civCount", n);
    }
    const filters = items.filter((item) => markOf(item) && !(item.parent && state(item.parent) === markOf(item)));
    $("ticked").hidden = !filters.length;
    $("chips").replaceChildren(...filters.map((item) => {
      const li = clone("chipTemplate");
      const chip = li.querySelector(".chip");
      chip.dataset.i = item.i;
      chip.dataset.state = markOf(item);
      li.querySelector(".chip-label").textContent = fill(words.ui[markOf(item) === "has" ? "clearHas" : "clearLacks"], { name: chipName(item) });
      li.querySelector(".chip-name").textContent = chipName(item);
      return li;
    }));
  }

  const plain = (text) => text.toLocaleLowerCase(tag).normalize("NFD").replace(/\p{M}/gu, "").replace(/[^\p{L}\p{N}]/gu, "");
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
      const mark = e.target === item.node && { " ": "has", x: "lacks", X: "lacks" }[e.key];
      if (mark) {
        e.preventDefault();
        toggle(item, mark);
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
      else if (e.key === "ArrowRight") isOpen(item) ? (to = item.kids[0]) : setOpen(item, true);
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
      if (twisty) return setOpen(items[twisty.dataset.i], !isOpen(items[twisty.dataset.i]));
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
      setMark(items[chip.dataset.i], null);
      update();
      const chips = $("chips").querySelectorAll(".chip");
      (chips[at] || chips[at - 1] || $("civTitle")).focus();
    });
  }

  const options = () => [...$("languageList").querySelectorAll("[data-language]")];
  function setMenu(open, focus) {
    $("languageButton").setAttribute("aria-expanded", String(open));
    $("languageList").hidden = !open;
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
  function preferredLanguage() {
    const codes = Object.keys(data.languages);
    const tags = codes.map((code) => data.languages[code].tag.toLowerCase());
    const asked = [params.get("lng"), attempt(() => localStorage.getItem("language"))].find((code) => codes.includes(code));
    if (asked) return asked;
    for (const wanted of navigator.languages ?? []) {
      const lower = wanted.toLowerCase();
      const at = tags.indexOf(lower) >= 0 ? tags.indexOf(lower) : tags.findIndex((t) => t.split("-")[0] === lower.split("-")[0]);
      if (at >= 0) return codes[at];
    }
    return codes[0];
  }
  function setLanguage(code) {
    language = code;
    tag = data.languages[code].tag;
    words = data.text[code];
    collator = new Intl.Collator(tag);
    plurals = new Intl.PluralRules(tag);
    numbers = new Intl.NumberFormat(tag);
    document.documentElement.lang = tag;
    for (const node of document.querySelectorAll("[data-text]")) node.textContent = words.ui[node.dataset.text];
    $("languageName").textContent = data.languages[code].name;
    for (const option of options()) {
      if (option.dataset.language === code) option.setAttribute("aria-current", "true");
      else option.removeAttribute("aria-current");
    }
    for (const item of items) item.label.textContent = nameOf(item);
    const seen = new Map();
    for (const item of items) seen.set(nameOf(item), (seen.get(nameOf(item)) ?? 0) + 1);
    shared = new Set([...seen].filter(([, n]) => n > 1).map(([name]) => name));
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
  function choose(code) {
    setLanguage(code);
    attempt(() => localStorage.setItem("language", code));
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

  function openReport(title, status) {
    $("reportTitle").textContent = title;
    $("reportStatus").textContent = status;
    $("reportList").replaceChildren();
    $("reportDownload").hidden = true;
    if (!$("report").open) $("report").showModal();
  }
  function report(line) {
    const li = clone("reportTemplate");
    li.textContent = line;
    $("reportList").append(li);
  }

  const isScalar = (value) => value === null || typeof value !== "object";
  const isFlatList = (value) => Array.isArray(value) && value.every(isScalar);
  const flat = (value) => (Array.isArray(value)
    ? `[${value.map(flat).join(", ")}]`
    : isScalar(value)
      ? JSON.stringify(value)
      : `{${Object.entries(value).map(([key, item]) => `${JSON.stringify(key)}: ${flat(item)}`).join(", ")}}`);
  function toJson(value, indent = "") {
    const inner = `${indent}  `;
    if (isScalar(value) || isFlatList(value)) return flat(value);
    if (Array.isArray(value)) return `[\n${value.map((item) => inner + toJson(item, inner)).join(",\n")}\n${indent}]`;
    const entries = Object.entries(value);
    const simple = entries.every(([, item]) => isScalar(item) || isFlatList(item));
    if (simple && (entries.length === 1 || indent.length + flat(value).length <= LINE_WIDTH)) return flat(value);
    const head = entries.slice(0, -1);
    const [lastKey, last] = entries[entries.length - 1];
    if (Array.isArray(last) && head.every(([, item]) => isScalar(item))) {
      const opening = head.map(([key, item]) => `${flat(key)}: ${flat(item)}, `).join("");
      return `{${opening}${flat(lastKey)}: [\n${last.map((item) => inner + toJson(item, inner)).join(",\n")}\n${indent}]}`;
    }
    return `{\n${entries.map(([key, item]) => `${inner}${flat(key)}: ${toJson(item, inner)}`).join(",\n")}\n${indent}}`;
  }

  const isLower = (char) => !!char && char !== char.toUpperCase() && char === char.toLowerCase();
  const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);
  function joinLines(text, settings) {
    let joined = "";
    for (const part of text.split("<br>").map((piece) => piece.trim())) {
      if (!part) continue;
      if (!joined) joined = part;
      else if (!settings.spaces) joined += part;
      else if (joined.endsWith("-") && settings.mergeHyphens && isLower(part[0])) joined = joined.slice(0, -1) + part;
      else if (joined.endsWith("-")) joined += part;
      else joined += ` ${part}`;
    }
    return joined.replace(/\s*\/\s*/g, "/").replace(/\s+/g, " ").trim();
  }
  function localName(strings, node, settings, offset) {
    const label = joinLines(strings[node.name_string_id] ?? "", settings);
    if (label && !ABBREVIATION.test(label)) return capitalise(label);
    const bold = /<b>(.*?)<\/b>/.exec(strings[node.help_string_id - offset] ?? "");
    return capitalise(bold ? joinLines(bold[1], settings) : label);
  }
  function availabilityOf(owners, civs) {
    const having = civs.filter((civ) => owners.has(civ));
    const lacking = civs.filter((civ) => !owners.has(civ));
    if (!lacking.length) return "all";
    return having.length <= lacking.length ? { has: having } : { lacks: lacking };
  }
  function missingText(set) {
    const codes = Object.keys(set.languages);
    const reference = set.text[codes[0]];
    const groups = [...new Set(treeKeys(set.tree, "group"))];
    return codes.flatMap((code) => {
      const text = set.text[code] ?? {};
      return [
        ...Object.keys(reference.ui).filter((key) => !text.ui?.[key]),
        ...groups.filter((key) => !text.groups?.[key]),
      ].map((name) => ({ language: set.languages[code].name, name }));
    });
  }
  function refresh(current, techtree, trees, strings) {
    const tools = current.tools;
    const messages = [];
    const say = (key, values) => messages.push(fill(tools[key], values));
    const civs = Object.keys(techtree.civs).sort();
    const nodes = new Map();
    const owners = new Map();
    civs.forEach((civ, i) => {
      for (const node of [...trees[i].buildings, ...trees[i].units_techs]) {
        if (!nodes.has(node.name)) {
          nodes.set(node.name, node);
          owners.set(node.name, new Set());
        }
        if (node.node_status !== "NotAvailable") owners.get(node.name).add(civ);
      }
    });
    const keys = treeKeys(current.tree, "item");
    const duplicates = [...new Set(keys.filter((key, i) => keys.indexOf(key) !== i))].sort();
    const unknown = keys.filter((key) => !nodes.has(key));
    duplicates.forEach((name) => say("duplicate", { name }));
    unknown.forEach((name) => say("unknown", { name }));
    if (duplicates.length || unknown.length) return { messages, fresh: null };

    const fresh = structuredClone(current);
    fresh.civs = civs;
    fresh.availability = Object.fromEntries(keys.map((key) => [key, availabilityOf(owners.get(key), civs)]));
    Object.entries(current.languages).forEach(([code, settings], i) => {
      const overrides = current.overrides[code] ?? {};
      const text = (fresh.text[code] ??= {});
      text.civs = Object.fromEntries(civs.map((civ) => [civ,
        overrides[civ] || capitalise(joinLines(strings[i][techtree.civs[civ].name_string_id] ?? "", settings)) || civ]));
      text.items = Object.fromEntries(keys.map((key) => [key,
        overrides[key] || localName(strings[i], nodes.get(key), settings, current.source.helpOffset) || key]));
    });
    const now = new Date();
    fresh.source.updated = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    civs.filter((civ) => !current.civs.includes(civ)).forEach((name) => say("civAdded", { name }));
    current.civs.filter((civ) => !civs.includes(civ)).forEach((name) => say("civRemoved", { name }));
    keys.filter((key) => key in current.availability && JSON.stringify(current.availability[key]) !== JSON.stringify(fresh.availability[key]))
      .forEach((name) => say("changed", { name }));
    keys.filter((key) => !owners.get(key).size).forEach((name) => say("nobody", { name }));
    for (const [code, settings] of Object.entries(current.languages)) {
      for (const section of ["civs", "items"]) {
        for (const [key, name] of Object.entries(fresh.text[code][section])) {
          const before = current.text[code]?.[section]?.[key];
          if (before !== undefined && before !== name) say("renamed", { language: settings.name, key, name });
        }
      }
    }
    [...nodes.keys()].filter((name) => !keys.includes(name) && !current.ignore.includes(name)).sort()
      .forEach((name) => say("unplaced", { name }));
    missingText(fresh).forEach((problem) => say("missingText", problem));
    return { messages, fresh };
  }
  async function runUpdate() {
    const tools = data.tools;
    openReport(tools.updateTitle, fill(tools.updateLoading, { source: data.source.name }));
    try {
      const get = async (path) => JSON.parse(await load(data.source.data + path));
      const techtree = await get("data.json");
      const civs = Object.keys(techtree.civs).sort();
      const [trees, strings] = await Promise.all([
        Promise.all(civs.map((civ) => get(`trees/${civ.toUpperCase()}.json`))),
        Promise.all(Object.keys(data.languages).map((code) => get(`locales/${code}/strings.json`))),
      ]);
      const { messages, fresh } = refresh(data, techtree, trees, strings);
      messages.forEach(report);
      if (!fresh) {
        $("reportStatus").textContent = tools.updateBlocked;
        return;
      }
      if (!messages.length) report(tools.updateSame);
      $("reportStatus").textContent = fill(tools.updateReady, {
        civs: fresh.civs.length, items: Object.keys(fresh.availability).length, languages: Object.keys(fresh.languages).length,
      });
      $("reportDownload").href = URL.createObjectURL(new Blob([`${toJson(fresh)}\n`], { type: "application/json" }));
      $("reportDownload").hidden = false;
    } catch (error) {
      $("reportStatus").textContent = fill(tools.updateFailed, { error: error.message });
    }
  }

  async function runTests(raw) {
    const results = [];
    const check = (name, ok, detail = "") => results.push({ name, ok: Boolean(ok), detail: String(detail) });
    const expect = (name, offenders) => check(name, !offenders.length, offenders.slice(0, 5).join("; "));
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const codes = Object.keys(data.languages);
    const keys = treeKeys(data.tree, "item");
    const before = { language, url: location.href, stored: attempt(() => localStorage.getItem("language")) };
    const root = document.documentElement;
    const slash = "/";

    const describe = (el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${el.classList[0] ? `.${el.classList[0]}` : ""}${
      el.closest(".node") && !el.id ? ` (${el.closest(".node").textContent.trim().slice(0, 40)})` : ""}`;
    const rendered = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden" && !el.closest(".sr-only");
    const everything = () => [...document.body.querySelectorAll("*")].filter(rendered);
    const focusables = () => [...document.querySelectorAll("a[href], button, input, select, textarea, [tabindex]")]
      .filter((el) => el.tabIndex >= 0 && !el.disabled && rendered(el));
    const textOf = (node) => [...node.childNodes].map((child) => (child.nodeType === Node.TEXT_NODE
      ? child.textContent
      : child.nodeType === Node.ELEMENT_NODE && child.getAttribute("aria-hidden") !== "true" ? textOf(child) : "")).join(" ");
    const tidy = (text) => text.replace(/\s+/g, " ").trim();
    const nameFor = (el) => {
      const ids = el.getAttribute("aria-labelledby");
      if (ids) return tidy(ids.split(/\s+/).map((id) => ($(id) ? textOf($(id)) : "")).join(" "));
      if (el.getAttribute("aria-label")) return tidy(el.getAttribute("aria-label"));
      if (el.labels?.length) return tidy([...el.labels].map(textOf).join(" "));
      return tidy(textOf(el));
    };
    const squash = (text) => text.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
    const visibleTexts = (el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const texts = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node.textContent.trim() && rendered(node.parentElement)) texts.push(node.textContent);
      }
      return texts;
    };
    const rgba = (value) => {
      const parts = (value.match(/[\d.]+/g) ?? []).map(Number);
      return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts.length > 3 ? parts[3] : 1];
    };
    const blend = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)];
    const backgroundOf = (el) => {
      const layers = [];
      for (let node = el; node; node = node.parentElement) {
        const color = rgba(getComputedStyle(node).backgroundColor);
        if (color[3] > 0) layers.push(color);
        if (color[3] === 1) break;
      }
      return layers.reverse().reduce((under, layer) => blend(layer, under), [255, 255, 255]);
    };
    const luminance = (rgb) => {
      const [r, g, b] = rgb.map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a, b) => {
      const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (light + 0.05) / (dark + 0.05);
    };
    const styles = (el) => [getComputedStyle(el), getComputedStyle(el, "::before"), getComputedStyle(el, "::after"), getComputedStyle(el, "::marker")];
    const keyDown = (target, key) => target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
    const tap = (el) => {
      el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse", button: 0 }));
      el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerType: "mouse", button: 0 }));
      el.click();
    };
    const type = (text) => {
      $("find").value = text;
      $("find").dispatchEvent(new Event("input", { bubbles: true }));
    };
    const pick = (code) => {
      if ($("languageList").hidden) $("languageButton").click();
      options().find((option) => option.dataset.language === code).click();
    };
    const reset = () => {
      type("");
      $("clear").click();
      $("collapseAll").click();
      setMenu(false);
      document.activeElement?.blur();
    };
    const listed = () => [...$("civs").children].map((li) => li.textContent);
    const expected = (set) => civsOf(set).map(civName).sort(collator.compare);
    const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
    const leaves = items.filter((item) => !item.group && !item.kids.length);
    const partial = leaves.find((item) => size(item.set) > 1 && size(item.set) < data.civs.length / 2 && item.parent?.parent);
    const other = leaves.find((item) => item !== partial && size(item.set & partial.set) > 0 && size(partial.set & ~item.set & ALL) > 0);
    const third = leaves.find((item) => ![partial, other].includes(item) && size(partial.set & ~other.set & ~item.set & ALL) > 0);
    const branch = items.find((item) => !item.group && item.kids.length > 1 && !shared.has(nameOf(item)));
    const group = items.find((item) => item.group && item.kids.length);

    function landing(label) {
      check(`${label}: every branch is collapsed`, items.every((item) => !isOpen(item)));
      check(`${label}: the page does not scroll`, root.scrollHeight <= innerHeight && root.scrollWidth <= innerWidth,
        `${root.scrollWidth}x${root.scrollHeight} in ${innerWidth}x${innerHeight}`);
      if (innerHeight >= (innerWidth >= 720 ? 640 : 800)) {
        expect(`${label}: everything fits without scrolling`,
          [...document.querySelectorAll(".content, .panes, .scroll")].filter((el) => el.scrollHeight > el.clientHeight + 1).map(describe));
      }
    }

    function audit(label, { focus = true } = {}) {
      const all = everything();
      check(`${label}: the page has a title`, document.title.trim());
      check(`${label}: the page language is set`, root.lang === tag, root.lang);
      expect(`${label}: language tags are valid`, [...document.querySelectorAll("[lang]")].filter((el) => !TAG.test(el.lang)).map(describe));
      expect(`${label}: each language choice is marked with its language`,
        options().filter((option) => option.lang !== data.languages[option.dataset.language].tag).map(describe));
      check(`${label}: one header, main and footer`, ["header", "main", "footer"].every((name) => document.querySelectorAll(name).length === 1));
      const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter(rendered);
      check(`${label}: one main heading`, headings.filter((h) => h.tagName === "H1").length === 1);
      expect(`${label}: headings have text and do not skip levels`, headings.filter((h, i) => !h.textContent.trim()
        || (i > 0 && Number(h.tagName[1]) > Number(headings[i - 1].tagName[1]) + 1)).map(describe));
      const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
      expect(`${label}: ids are unique`, ids.filter((id, i) => ids.indexOf(id) !== i));
      expect(`${label}: ARIA references point to elements`, [...document.querySelectorAll("[aria-labelledby], [aria-controls], [aria-describedby]")]
        .flatMap((el) => ["aria-labelledby", "aria-controls", "aria-describedby"]
          .flatMap((name) => (el.getAttribute(name) ?? "").split(/\s+/).filter((id) => id && !$(id)).map((id) => `${describe(el)} ${id}`))));
      expect(`${label}: checkboxes say whether they are checked`, [...document.querySelectorAll("[role=checkbox]")]
        .filter((el) => !["true", "false", "mixed"].includes(el.getAttribute("aria-checked"))).map(describe));
      expect(`${label}: branch buttons say whether they are open`, items.filter((item) => item.twisty
        && item.twisty.getAttribute("aria-expanded") !== String(!item.list.hidden)).map(nameOf));
      check(`${label}: the menu button says whether the menu is open`,
        $("languageButton").getAttribute("aria-expanded") === String(!$("languageList").hidden));
      const controls = focusables().filter((el) => el.matches("a, button, input, [role=checkbox]"));
      expect(`${label}: every control has a name`, [...controls, ...document.querySelectorAll("[role=checkbox]")]
        .filter((el) => rendered(el) && !nameFor(el)).map(describe));
      expect(`${label}: every control's name contains its visible text`, controls.filter((el) => !el.matches("input"))
        .filter((el) => visibleTexts(el).map(squash).some((text) => text && !squash(nameFor(el)).includes(text))).map(describe));
      expect(`${label}: text has a contrast of at least 7:1, or 4.5:1 when large`, [...new Set(all.flatMap((el) => [...el.childNodes]
        .filter((child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim()).map(() => el)))]
        .flatMap((el) => {
          const style = getComputedStyle(el);
          const behind = backgroundOf(el);
          const ratio = contrast(blend(rgba(style.color), behind), behind);
          const fontSize = parseFloat(style.fontSize);
          const large = fontSize >= 24 || (fontSize >= 18.66 && Number(style.fontWeight) >= 700);
          return ratio < (large ? 4.5 : 7) ? [`${describe(el)} ${ratio.toFixed(2)}`] : [];
        }));
      expect(`${label}: control borders have a contrast of at least 3:1`, all.filter((el) => el.matches(".tool, .chip, input, .box"))
        .flatMap((el) => {
          const style = getComputedStyle(el);
          const behind = backgroundOf(el.parentElement);
          const ratio = contrast(blend(rgba(style.borderTopColor), behind), behind);
          return parseFloat(style.borderTopWidth) > 0 && ratio < 3 ? [`${describe(el)} ${ratio.toFixed(2)}`] : [];
        }));
      const inline = (el) => el.matches("p a") && tidy(el.parentElement.textContent) !== tidy(el.textContent);
      expect(`${label}: targets are at least 44 by 44 pixels`, focusables().filter((el) => !inline(el)).filter((el) => {
        const box = el.getBoundingClientRect();
        return box.width < 43.5 || box.height < 43.5;
      }).map(describe));
      check(`${label}: the page does not scroll`, root.scrollHeight <= innerHeight && root.scrollWidth <= innerWidth,
        `${root.scrollWidth}x${root.scrollHeight} in ${innerWidth}x${innerHeight}`);
      expect(`${label}: nothing sticks out sideways`, all.filter((el) => {
        const box = el.getBoundingClientRect();
        return box.right > innerWidth + 0.5 || box.left < -0.5;
      }).map(describe));
      expect(`${label}: text is not justified and has 1.5 line spacing`, all.filter((el) => el.matches("p, li")).filter((el) => {
        const style = getComputedStyle(el);
        return style.textAlign === "justify" || !(parseFloat(style.lineHeight) >= 1.5 * parseFloat(style.fontSize) - 0.01);
      }).map(describe));
      expect(`${label}: no images, sounds or video`,
        [...document.querySelectorAll("img, svg, canvas, picture, video, audio, object, embed, iframe, source, track, map, area")].map(describe));
      expect(`${label}: no images in the styles`, all.filter((el) => styles(el).some((style) => style.backgroundImage !== "none"
        || style.listStyleImage !== "none" || style.borderImageSource !== "none" || /url\(/.test(style.content))).map(describe));
      check(`${label}: nothing is animated`, document.getAnimations().length === 0, document.getAnimations().length);
      expect(`${label}: no transitions or animations in the styles`, all.filter((el) => styles(el).some((style) => style.animationName
        .split(",").some((name) => name.trim() !== "none") || style.transitionDuration.split(",").some((time) => parseFloat(time) > 0)))
        .map(describe));
      if (!focus) return;
      const outlines = [];
      const hidden = [];
      for (const el of focusables()) {
        el.focus();
        if (document.activeElement !== el) {
          outlines.push(`${describe(el)} cannot take focus`);
          continue;
        }
        const style = getComputedStyle(el);
        const behind = parseFloat(style.outlineOffset) >= 0 ? backgroundOf(el.parentElement) : backgroundOf(el);
        if (style.outlineStyle === "none" || parseFloat(style.outlineWidth) < 2
          || contrast(blend(rgba(style.outlineColor), behind), behind) < 3) outlines.push(describe(el));
        const view = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
        for (let clip = el.parentElement; clip; clip = clip.parentElement) {
          if (getComputedStyle(clip).overflowY === "visible") continue;
          const edge = clip.getBoundingClientRect();
          Object.assign(view, {
            left: Math.max(view.left, edge.left), top: Math.max(view.top, edge.top),
            right: Math.min(view.right, edge.right), bottom: Math.min(view.bottom, edge.bottom),
          });
        }
        const box = el.getBoundingClientRect();
        const x = (Math.max(box.left, view.left) + Math.min(box.right, view.right)) / 2;
        const y = (Math.max(box.top, view.top) + Math.min(box.bottom, view.bottom)) / 2;
        const hit = document.elementFromPoint(x, y);
        if (!hit || !el.contains(hit)) hidden.push(`${describe(el)} under ${hit ? describe(hit) : "nothing"} at ${Math.round(x)},${Math.round(y)}`);
      }
      document.activeElement?.blur();
      expect(`${label}: focus shows a thick outline with a contrast of at least 3:1`, outlines);
      expect(`${label}: nothing covers what has focus`, hidden);
    }

    function sourceTests(page, sheet, code) {
      check("rules: index.html has no comments", !page.includes("<!--"));
      check("rules: style.css has no comments", !sheet.includes(slash + "*"));
      check("rules: script.js has no comments", !code.includes(slash + "*") && !code.includes(slash + slash));
      check("rules: index.html has no CSS", !/<style\b|\sstyle\s*=/i.test(page));
      const scripts = page.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) ?? [];
      check("rules: index.html has no JavaScript of its own",
        scripts.length === 1 && scripts[0] === "<script src=\"script.js\" defer></script>" && !/\son[a-z]+\s*=|javascript:/i.test(page));
      const links = page.match(/<link\b[^>]*>/gi) ?? [];
      check("rules: index.html loads only style.css and script.js",
        links.length === 1 && links[0] === "<link rel=\"stylesheet\" href=\"style.css\">" && !/\s(src|href)="[a-z]+:/i.test(page));
      check("rules: script.js has no CSS or HTML",
        !/\.style\s*[.=[]|setAttribute\(\s*["']style|\.(innerHTML|outerHTML|insertAdjacentHTML)\b|createElement\s*\(|document\.write/.test(code));
      check("rules: no images in the sources", !/<(img|svg|canvas|picture|video|audio|object|embed)\b/i.test(page) && !/url\(/i.test(sheet));
      check("rules: no animations in the sources", !/@keyframes|\banimation|\btransition/i.test(sheet) && !/\.animate\s*\(/.test(code));
      check("rules: no sounds in the sources", !/new\s+(Audio|AudioContext)\b/.test(code));
      check("rules: no dependencies", !/\bimport\s*\(|^\s*import\s|\brequire\s*\(/m.test(code) && !/@import/i.test(sheet));
      expect("rules: script.js holds no game data", [...data.civs, ...keys].filter((name) => code.includes(JSON.stringify(name))));
    }

    function dataTests() {
      expect("data: each item is in the tree once", keys.filter((key, i) => keys.indexOf(key) !== i));
      expect("data: each item says which civilisations have it", keys.filter((key) => !(key in data.availability)));
      expect("data: availability names only known civilisations", Object.entries(data.availability)
        .filter(([, rule]) => rule !== "all" && (rule.has ?? rule.lacks ?? [null]).some((civ) => !data.civs.includes(civ))).map(([key]) => key));
      expect("data: each language has a name and a valid tag",
        codes.filter((code) => !data.languages[code].name || !TAG.test(data.languages[code].tag)));
      expect("data: each language has all of the page's text", missingText(data).map(({ language: name, name: key }) => `${name}: ${key}`));
      expect("data: each language names every item and civilisation", codes.flatMap((code) => [
        ...keys.filter((key) => !data.text[code].items?.[key]),
        ...data.civs.filter((civ) => !data.text[code].civs?.[civ]),
      ].map((key) => `${code}: ${key}`)));
      expect("data: counted texts have an 'other' form", codes.flatMap((code) => Object.entries(data.text[code].ui)
        .filter(([, value]) => typeof value === "object" && !value.other).map(([key]) => `${code}: ${key}`)));
      const holes = (value) => [...new Set(JSON.stringify(value ?? "").match(/\{\w+\}/g) ?? [])].sort().join();
      expect("data: translations keep the same placeholders", codes.flatMap((code) => Object.entries(data.text[codes[0]].ui)
        .filter(([key, english]) => holes(english) !== holes(data.text[code].ui[key])).map(([key]) => `${code}: ${key}`)));
      expect("data: overrides are for known languages", Object.keys(data.overrides).filter((code) => !codes.includes(code)));
      expect("data: overrides name known items and civilisations", codes.flatMap((code) => Object.keys(data.overrides[code] ?? {})
        .filter((key) => !keys.includes(key) && !data.civs.includes(key)).map((key) => `${code}: ${key}`)));
      check("data: the source is described", data.source.name && data.source.url && data.source.data
        && Number.isInteger(data.source.helpOffset) && /^\d{4}-\d{2}$/.test(data.source.updated));
      expect("data: the test and update texts are filled in", Object.entries(data.tools).filter(([, text]) => !text).map(([key]) => key));
      check("data: the ignore list is a list of names", Array.isArray(data.ignore) && data.ignore.every((name) => typeof name === "string"));
    }

    function updaterTests() {
      check("update: the data.json writer keeps every value", JSON.stringify(JSON.parse(toJson(data))) === JSON.stringify(data));
      expect("update: availability is stored in its shortest form", keys.filter((key) => JSON.stringify(availabilityOf(
        new Set(civsOf(setOf(data.availability[key]))), data.civs)) !== JSON.stringify(data.availability[key])));
      expect("update: stored names are already tidy", codes.flatMap((code) => [
        ...Object.values(data.text[code].items), ...Object.values(data.text[code].civs),
      ].filter((name) => joinLines(name, data.languages[code]) !== name).map((name) => `${code}: ${name}`)));
    }

    async function behaviourTests() {
      reset();
      tap(partial.node);
      check("marking: a click marks an item must have", partial.self === "has" && partial.node.getAttribute("aria-checked") === "true");
      check("marking: the civilisations that have it are listed in order", same(listed(), expected(partial.set)));
      check("marking: the count says how many are listed", $("count").textContent === plural("compatible", size(partial.set)));
      const chip = $("chips").querySelector(".chip");
      check("marking: a filter button appears", $("chips").children.length === 1
        && chip.querySelector(".chip-label").textContent === fill(words.ui.clearHas, { name: chipName(partial) }));
      keyDown(other.node, "x");
      check("marking: X marks an item must lack", other.self === "lacks" && other.lacking.textContent === words.ui.lacking);
      check("marking: civilisations with a must-lack item leave the list", same(listed(), expected(partial.set & ~other.set & ALL)));
      const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
      third.node.dispatchEvent(menu);
      check("marking: the menu key marks an item must lack", third.self === "lacks" && menu.defaultPrevented);
      keyDown(partial.node, " ");
      check("marking: Space on a marked item clears it", partial.self === null);
      const firstChip = $("chips").querySelector(".chip");
      const cleared = items[firstChip.dataset.i];
      const left = cleared === other ? third : other;
      firstChip.click();
      check("filters: a filter button clears its item and moves focus to the next", cleared.self === null
        && document.activeElement === $("chips").querySelector(".chip") && Number(document.activeElement.dataset.i) === left.i);
      document.activeElement.click();
      check("filters: clearing the last filter moves focus to the civilisations heading", left.self === null && document.activeElement === $("civTitle"));
      check("filters: with nothing marked the list is empty and the hint shows", !listed().length && !$("none").hidden
        && $("none").textContent === words.ui.start && $("ticked").hidden);

      const node = third.node;
      const box = node.getBoundingClientRect();
      const touch = { bubbles: true, pointerId: 7, pointerType: "touch", button: 0, clientX: box.left + 5, clientY: box.top + 5 };
      node.dispatchEvent(new PointerEvent("pointerdown", touch));
      await wait(600);
      node.dispatchEvent(new PointerEvent("pointerup", touch));
      node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      check("marking: a long press marks an item must lack", third.self === "lacks");
      const mouse = { bubbles: true, pointerId: 8, pointerType: "mouse", button: 2, clientX: box.left + 5, clientY: box.top + 5 };
      node.dispatchEvent(new PointerEvent("pointerdown", mouse));
      node.dispatchEvent(new PointerEvent("pointerup", mouse));
      node.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 2 }));
      check("marking: a right-click on a must-lack item clears it", third.self === null);

      tap(branch.node);
      check("marking: marking a branch marks everything in it", state(branch) === "has" && items.filter((item) => {
        for (let p = item.parent; p; p = p.parent) if (p === branch) return true;
        return false;
      }).every((item) => item.group || item.self === "has"));
      check("filters: a whole branch has one filter button", $("chips").children.length === 1
        && $("chips").querySelector(".chip-name").textContent === fill(words.ui.full, { name: nameOf(branch) }));
      tap(branch.kids[0].node);
      check("marking: a partly marked branch is mixed", state(branch) === "mixed" && branch.node.getAttribute("aria-checked") === "mixed");
      $("clear").click();
      tap(group.node);
      check("marking: marking a group marks what is in it", state(group) === "has" && group.self === null);
      $("clear").click();
      check("marking: Clear clears everything", items.every((item) => item.self === null));
      expect("counts: each item counts the civilisations that have all of it", items.filter((item) => item.count.textContent !== numbers.format(size(item.all))
        || item.civCount.textContent !== plural("civCount", size(item.all))).map(nameOf));

      $("expandAll").click();
      check("tree: Expand all opens every branch", items.every((item) => !item.twisty || isOpen(item)));
      $("collapseAll").click();
      check("tree: Collapse all closes every branch", items.every((item) => !isOpen(item)));
      roots[0].twisty.click();
      check("tree: an arrow opens its branch", isOpen(roots[0]) && !roots[0].list.hidden);
      roots[0].twisty.click();
      check("tree: an arrow closes its branch", !isOpen(roots[0]) && roots[0].list.hidden);

      roots[0].node.focus();
      keyDown(roots[0].node, "ArrowDown");
      check("keyboard: Down goes to the next item", document.activeElement === roots[1].node);
      keyDown(roots[1].node, "ArrowRight");
      check("keyboard: Right opens a branch", isOpen(roots[1]));
      keyDown(roots[1].node, "ArrowRight");
      check("keyboard: Right goes into an open branch", document.activeElement === roots[1].kids[0].node);
      keyDown(roots[1].kids[0].node, "ArrowLeft");
      check("keyboard: Left goes to the parent", document.activeElement === roots[1].node);
      keyDown(roots[1].node, "ArrowLeft");
      check("keyboard: Left closes a branch", !isOpen(roots[1]));
      keyDown(roots[1].node, "End");
      check("keyboard: End goes to the last item", document.activeElement === roots[roots.length - 1].node);
      keyDown(document.activeElement, "Home");
      check("keyboard: Home goes to the first item", document.activeElement === roots[0].node);
      keyDown(roots[0].node, "ArrowUp");
      check("keyboard: Up at the top stays put", document.activeElement === roots[0].node);
      roots[0].twisty.focus();
      keyDown(roots[0].twisty, "ArrowDown");
      check("keyboard: on an arrow, Down goes to the next arrow", document.activeElement === roots[1].twisty);
      document.activeElement.blur();

      type(nameOf(partial));
      const matches = items.filter((item) => plain(nameOf(item)).includes(plain(nameOf(partial))));
      check("find: matches are marked", partial.node.classList.contains("found") && items.every((item) => item.node.classList.contains("found") === matches.includes(item)));
      check("find: branches open down to each match", matches.every((item) => shown(item)));
      check("find: the number found is announced", $("found").textContent === plural("found", matches.length));
      keyDown($("find"), "Enter");
      check("find: Enter goes to the first match", document.activeElement === matches[0].node);
      type("qqqqzzzzqqqq");
      check("find: no match says none found", $("found").textContent === words.ui.noneFound && !document.querySelector(".found"));
      type("");
      check("find: an empty search clears the result", $("found").textContent === "");
      reset();
    }

    function menuTests() {
      reset();
      const button = $("languageButton");
      button.click();
      check("language menu: the button opens the menu", button.getAttribute("aria-expanded") === "true" && !$("languageList").hidden);
      check("language menu: every language is offered in its own language", options().length === codes.length
        && options().every((option) => option.textContent === data.languages[option.dataset.language].name));
      check("language menu: the current language is marked", options().filter((option) => option.getAttribute("aria-current") === "true")
        .map((option) => option.dataset.language).join() === language);
      audit("accessibility (language menu open)", { focus: false });
      keyDown(options()[0], "Escape");
      check("language menu: Escape closes it and returns focus", $("languageList").hidden && document.activeElement === button);
      keyDown(button, "ArrowDown");
      check("language menu: Down opens it at the current language", !$("languageList").hidden
        && document.activeElement === options().find((option) => option.dataset.language === language));
      const at = options().indexOf(document.activeElement);
      keyDown(document.activeElement, "ArrowDown");
      check("language menu: Down goes to the next language", document.activeElement === options()[(at + 1) % codes.length]);
      keyDown(document.activeElement, "End");
      check("language menu: End goes to the last language", document.activeElement === options()[codes.length - 1]);
      $("find").focus();
      check("language menu: leaving it closes it", $("languageList").hidden && button.getAttribute("aria-expanded") === "false");
      const first = language;
      const next = codes.find((code) => code !== first);
      tap(partial.node);
      pick(next);
      check("language menu: choosing a language changes the page language", root.lang === data.languages[next].tag
        && document.querySelector("h1").textContent === data.text[next].ui.title);
      check("language menu: choosing closes the menu and returns focus", $("languageList").hidden && document.activeElement === button);
      check("language menu: the button names the new language", nameFor(button).includes(data.languages[next].name));
      check("language menu: the choice is kept in the address", location.protocol === "file:" || new URLSearchParams(location.search).get("lng") === next);
      check("language menu: marks are kept", partial.self === "has" && same(listed(), expected(partial.set)));
      pick(first);
      reset();
    }

    async function languageTests(code) {
      reset();
      pick(code);
      reset();
      const ui = data.text[code].ui;
      check(`${code}: the page language is set`, root.lang === data.languages[code].tag);
      expect(`${code}: the page's text is in the language`, [...document.querySelectorAll("[data-text]")]
        .filter((el) => el.textContent !== ui[el.dataset.text]).map((el) => el.dataset.text));
      expect(`${code}: the tree is in the language`, items.filter((item) => item.label.textContent !== nameOf(item)
        || nameOf(item) !== (item.group ? data.text[code].groups[item.key] : data.text[code].items[item.key])).map((item) => item.key));
      expect(`${code}: no placeholders are left in the text`, visibleTexts(document.body).filter((text) => /[{}]/.test(text)));
      check(`${code}: the footer names and links the source`, $("source").contains($("sourceLink")) && $("sourceLink").textContent === data.source.name
        && $("sourceLink").getAttribute("href") === data.source.url);
      landing(`landing page (${code})`);
      audit(`accessibility (${code})`, { focus: code === codes[0] });
      tap(partial.node);
      keyDown(other.node, "x");
      check(`${code}: the civilisations are listed in the language and in order`, same(listed(), expected(partial.set & ~other.set & ALL)));
      audit(`accessibility (${code}, filters)`, { focus: code === codes[0] });
      $("expandAll").click();
      audit(`accessibility (${code}, all open)`, { focus: code === codes[0] });
      reset();
    }

    function spacingTests() {
      reset();
      tap(partial.node);
      root.classList.add("text-spacing-test");
      check("text spacing: the page does not scroll sideways", root.scrollWidth <= innerWidth);
      expect("text spacing: nothing sticks out sideways", everything().filter((el) => el.getBoundingClientRect().right > innerWidth + 0.5).map(describe));
      root.classList.remove("text-spacing-test");
      reset();
    }

    check(`window: ${innerWidth} by ${innerHeight} pixels, ${matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"} colours`, true);
    try {
      const [page, sheet, code] = await Promise.all(["index.html", "style.css", "script.js"].map(load));
      landing(`landing page (${language})`);
      audit(`accessibility (${language}, landing page)`);
      sourceTests(page, sheet, code);
      dataTests();
      updaterTests();
      check("test items were found in the data", partial && other && third && branch && group);
      pick(codes[0]);
      await behaviourTests();
      menuTests();
      for (const code of codes) await languageTests(code);
      spacingTests();
    } catch (error) {
      check("the tests ran to the end", false, error.stack || error.message);
    }
    reset();
    setLanguage(before.language);
    attempt(() => history.replaceState(history.state, "", before.url));
    attempt(() => (before.stored === null ? localStorage.removeItem("language") : localStorage.setItem("language", before.stored)));
    if (params.has("frame")) {
      root.dataset.tests = results.every((result) => result.ok) ? "passed" : "failed";
      parent.postMessage({ results }, "*");
      return;
    }
    for (const size of ["small", "phone", "tall"]) results.push(...await framed(size));
    const failed = results.filter((result) => !result.ok);
    root.dataset.tests = failed.length ? "failed" : "passed";
    const tools = data.tools;
    openReport(tools.testTitle, failed.length ? fill(tools.testFailed, { failed: failed.length, n: results.length }) : fill(tools.testPassed, { n: results.length }));
    for (const result of [...failed, ...results.filter((r) => r.ok)]) report(fill(result.ok ? tools.pass : tools.fail, result));
  }

  function framed(size) {
    return new Promise((resolve) => {
      const frame = clone("frameTemplate");
      let timer = 0;
      const listen = (e) => {
        if (e.source === frame.contentWindow) done(e.data.results);
      };
      const done = (results) => {
        removeEventListener("message", listen);
        clearTimeout(timer);
        frame.remove();
        resolve(results.map((result) => ({ ...result, name: `${size}: ${result.name}` })));
      };
      timer = setTimeout(() => done([{ name: "the tests finished", ok: false, detail: "no answer" }]), 300000);
      addEventListener("message", listen);
      frame.classList.add(size);
      frame.title = data.tools.frameTitle;
      frame.src = `index.html?test&frame=${size}`;
      document.body.append(frame);
    });
  }

  function start(loaded) {
    data = loaded;
    civBit = new Map(data.civs.map((civ, i) => [civ, 1n << BigInt(i)]));
    ALL = (1n << BigInt(data.civs.length)) - 1n;
    collect(data.tree, null);
    items.forEach(whole);
    build(roots, $("tree"));
    buildLanguages();
    for (const node of document.querySelectorAll("[data-tool]")) node.textContent = data.tools[node.dataset.tool];
    wireTree();
    wireLanguages();
    setLanguage(preferredLanguage());
    $("top").hidden = false;
    $("content").hidden = false;
  }

  load("data.json").then((raw) => {
    start(JSON.parse(raw));
    if (params.has("test")) return runTests(raw);
    if (params.has("update")) return runUpdate();
    return null;
  }).catch((error) => {
    $("loadError").hidden = false;
    if (params.has("test")) document.documentElement.dataset.tests = "failed";
    if (params.has("frame")) parent.postMessage({ results: [{ name: "the page loaded", ok: false, detail: error.message }] }, "*");
    throw error;
  });
})();
