import { data, ALL, size, attempt, recall, language, nameOf } from "../datahandler.js";
import { items } from "../model.js";
import { $, options, setInclude } from "../ui.js";
import { audit } from "./audit.js";
import {
  root, check, expect, same, codes, keys, describe, everything, nameFor, visibleTexts, keyDown, tap, pick, reset, listed, expected,
} from "./helpers.js";

export function menuTests({ partial }) {
  reset();
  tap(partial.node);
  const button = $("languageButton");
  const current = () => options().find((option) => option.dataset.language === language);
  $("optionsButton").focus();
  $("optionsButton").click();
  const inWindow = $("options").open && $("options").contains(button) && document.activeElement === button;
  const size = () => {
    const box = $("options").getBoundingClientRect();
    return `${box.width} by ${box.height}`;
  };
  const sizes = [size()];
  button.click();
  sizes.push(size());
  check("language menu: it is in the options window, and its button opens it, offering every language in its own language, with the current one marked",
    inWindow && button.getAttribute("aria-expanded") === "true" && !$("languageList").hidden && options().length === codes().length
    && options().every((option) => option.textContent === data.languages[option.dataset.language].name)
    && options().filter((option) => option.getAttribute("aria-current") === "true").map((option) => option.dataset.language).join() === language);
  audit("language menu open", { focus: false });
  keyDown(options()[0], "Escape");
  const escaped = $("languageList").hidden && document.activeElement === button;
  sizes.push(size());
  keyDown(button, "ArrowDown");
  const atCurrent = !$("languageList").hidden && document.activeElement === current();
  const at = options().indexOf(document.activeElement);
  keyDown(document.activeElement, "ArrowDown");
  const stepped = document.activeElement === options()[(at + 1) % codes().length];
  keyDown(document.activeElement, "End");
  check("language menu: Down opens it at the current language, and Down and End move through it", atCurrent && stepped
    && document.activeElement === options()[codes().length - 1]);
  $("options").querySelector("form button").focus();
  check("language menu: Escape closes it and returns focus, leaving it closes it, and opening or closing it never changes the window's size",
    escaped && $("languageList").hidden && button.getAttribute("aria-expanded") === "false" && new Set(sizes).size === 1, sizes.join(", "));
  const first = language;
  const next = codes().find((code) => code !== first);
  pick(next);
  check("language menu: choosing a language changes the page language, names it on the button, closes the menu and returns focus",
    root.lang === data.languages[next].tag && document.querySelector("h1").textContent === data.text[next].ui.title
    && $("languageList").hidden && document.activeElement === button && nameFor(button).includes(data.languages[next].name));
  check("language menu: the choice is kept in the address", location.protocol === "file:" || new URLSearchParams(location.search).get("lng") === next);
  check("language menu: marks are kept when the language changes", partial.self === "has" && same(listed(), expected(partial.set)));
  pick(first);
  reset();
}

export function languageTests(code, { partial, other }) {
  reset();
  pick(code);
  reset();
  const text = data.text[code];
  const first = code === codes()[0];
  const note = (name, offenders) => check(name, !offenders.length, `${code}: ${offenders.slice(0, 3).join("; ")}`);
  note("languages: the page's text is in the chosen language", [...document.querySelectorAll("[data-text]")]
    .filter((el) => el.textContent !== text.ui[el.dataset.text]).map((el) => el.dataset.text));
  note("languages: the tree is in the chosen language", items.filter((item) => item.label.textContent !== nameOf(item)
    || nameOf(item) !== (item.group ? text.groups[item.key] : text.items[item.key])).map((item) => item.key));
  note("languages: no placeholders are left in the text", visibleTexts(document.body).filter((value) => /[{}]/.test(value)));
  check("languages: the footer names and links the source", $("source").contains($("sourceLink")) && $("sourceLink").textContent === data.source.name
    && $("sourceLink").getAttribute("href") === data.source.url, code);
  audit(code, { focus: first });
  tap(partial.node);
  keyDown(other.node, "x");
  check("languages: the civilisations are listed in the language and in order", same(listed(), expected(partial.set & ~other.set & ALL)), code);
  audit(`${code}, filters`, { focus: first });
  $("expandAll").click();
  audit(`${code}, all open`, { focus: first });
  reset();
}

export function optionTests() {
  reset();
  const all = keys();
  const underUnique = (nodes, inside) => nodes.flatMap((node) => [
    ...(inside && node.item ? [node.item] : []), ...underUnique(node.kids ?? [], inside || node.unique === true),
  ]);
  const uniqueKeys = new Set(underUnique(data.tree, false));
  const shownKeys = () => items.filter((item) => !item.group).map((item) => item.key);
  check("options: by default, unique items, and items every civilisation or only one has, are left out", shownKeys().length < all.length
    && shownKeys().every((key) => !uniqueKeys.has(key))
    && items.every((item) => item.kids.length > 0 || (!item.group && ![1, data.civs.length].includes(size(item.set)))));
  const kept = items.find((item) => !item.group && !item.kids.length && item.parent);
  const path = kept.path;
  const now = () => items.find((item) => item.path === path);
  tap(kept.node);
  const listedBefore = listed();
  const button = $("optionsButton");
  button.focus();
  button.click();
  const opened = $("options").open && $("include").getAttribute("aria-checked") === "false";
  audit("accessibility (options window open)", { focus: false });
  $("include").click();
  check("options: ticking the box shows every item, unique and universal ones included, keeping marks",
    $("include").getAttribute("aria-checked") === "true" && $("include").dataset.state === "has" && shownKeys().length === all.length
    && now()?.self === "has" && same(listed(), listedBefore));
  check("options: the choice is remembered", recall("include") === "true" || attempt(() => localStorage) === null);
  keyDown($("include"), " ");
  check("options: Space unticks the box and leaves those items out again, keeping marks", $("include").getAttribute("aria-checked") === "false"
    && shownKeys().every((key) => !uniqueKeys.has(key)) && now()?.self === "has" && same(listed(), listedBefore));
  $("options").querySelector("form button").click();
  check("options: the Options button opens the window with the box unticked, and Close closes it and returns focus", opened
    && !$("options").open && document.activeElement === button);
  reset();
  setInclude(true);
  $("expandAll").click();
  audit("accessibility (everything included, all open)", { focus: false });
  reset();
  setInclude(false);
}

export function spacingTests({ partial }) {
  reset();
  tap(partial.node);
  root.classList.add("text-spacing-test");
  expect("layout: with wider text spacing, nothing sticks out sideways", [
    ...(root.scrollWidth > innerWidth ? [`the page is ${root.scrollWidth} pixels wide`] : []),
    ...everything().filter((el) => el.getBoundingClientRect().right > innerWidth + 0.5).map(describe),
  ]);
  root.classList.remove("text-spacing-test");
  reset();
}
