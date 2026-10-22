import { data, size, attempt, recall, nameOf, iconFile } from "../datahandler.js";
import { items } from "../model.js";
import { $ } from "../stringbuilder.js";
import { setInclude, setSimple } from "../optionshandler.js";
import {
  root, check, expect, loaded, same, describe, rendered, everything, keyDown, tap, type, reset, beside, edges, spans,
  need, pictures, simpleSpot, picturesOn, civLinks, simpleTicked, tabIcons, drawn, ui, box, fixtures,
} from "./helpers.js";

const rows = { has: 50, lacks: 100 };

const sharp = () => (innerWidth > 1920 || innerHeight > 1080 || devicePixelRatio > 1 ? "4k" : "sd");

const at = (url, path) => url.endsWith(`/assets/images/${path}.webp")`);

const picture = (style, path) => at(style.backgroundImage, path);

function offParchment(style) {
  const [left, top, right, bottom] = ["--left", "--top", "--right", "--bottom"]
    .map((name) => Number(style.getPropertyValue(name)));
  const [w, h] = style.getPropertyValue("--ratio").split("/").map(Number);
  const wide = Math.max(innerWidth, innerHeight * w / h);
  const high = Math.max(innerHeight, innerWidth * h / w);

  const x = (share) => (innerWidth - wide) / 2 + wide * share;

  const y = (share) => (innerHeight - high) / 2 + high * share;

  $("content").scrollTop = 0;
  const clip = getComputedStyle($("content")).overflowY === "visible" ? Infinity : box($("content")).bottom;
  return [$("top"), $("content"), ...$("content").querySelectorAll(".pane, .foot")].filter(rendered).filter((el) => {
    const edge = box(el);
    return edge.left < x(left) - 0.5 || edge.right > x(right) + 0.5 || edge.top < y(top) - 0.5
      || Math.min(edge.bottom, clip) > y(bottom) + 0.5;
  }).map(describe);
}

function strayCursors() {
  const scale = innerWidth > 2560 || innerHeight > 1440 ? "x2" : "x1";

  const wanted = (el) => `ui/cursors/cursor_${el.closest(".civs a, .foot a") ? "pointing" : "normal"}_${scale}`;

  return [root, document.body, ...everything()]
    .filter((el) => !getComputedStyle(el).cursor.includes(`/assets/images/${wanted(el)}.webp"`)).map(describe);
}

function pictureLooks() {
  const style = getComputedStyle(document.body);
  const wanted = innerWidth / innerHeight > 16 / 9 ? "ultrawide"
    : innerWidth > 2560 || innerHeight > 1440 ? "uhd" : innerWidth > 1920 || innerHeight > 1080 ? "qhd" : "fhd";
  const button = getComputedStyle($("optionsButton"));
  expect("options: without Simple UI, the pictures and cursors suit the screen, the Options button and the tab show "
    + "theirs, and the page fits the parchment", [
    ...need(picture(style, `ui/backgrounds/${wanted}`), `${style.backgroundImage.split("/").pop()}, not ${wanted}`),
    ...offParchment(style).map((name) => `${name} is off the parchment`),
    ...strayCursors().slice(0, 3).map((name) => `${name} has the wrong cursor`),
    ...need(picture(button, `ui/buttons/options_${sharp()}`), `${button.backgroundImage.split("/").pop()} on Options`),
    ...need(button.backgroundPosition.split(" ").every((part) => parseFloat(part) === 0), "Options is not at rest"),
    ...need(button.boxShadow === "rgb(238, 157, 5) 0px 0px 0px 2px", "Options has no ring"),
    ...need(tabIcons().map((link) => link.getAttribute("href")).join() === data.icons.favicon, "the tab has no icon"),
    ...need(root.scrollHeight <= innerHeight && root.scrollWidth <= innerWidth, "the page scrolls"),
    ...need(spans(), "the footer does not span the page"),
  ]);
}

function wrongBoxes() {
  const boxes = [...document.querySelectorAll(".box")].filter((el) => {
    const look = getComputedStyle(el);
    const state = el.parentElement.dataset.state;
    return !picture(look, `ui/checkboxes/checkboxes_${sharp()}`) || look.backgroundSize !== "300% 300%"
      || parseFloat(look.backgroundPositionX) !== 0 || parseFloat(look.backgroundPositionY) !== (rows[state] ?? 0)
      || drawn(el) !== (state === "mixed" ? "black dash" : "");
  });
  const radios = [...$("views").querySelectorAll("input")].filter((input) => {
    const look = getComputedStyle(input);
    return !picture(look, `ui/checkboxes/radiobutton_${sharp()}`) || look.backgroundSize !== "200% 200%"
      || parseFloat(look.backgroundPositionX) !== 0
      || parseFloat(look.backgroundPositionY) !== (input.checked ? 100 : 0);
  });
  const states = ["has", "lacks", "mixed"].filter((state) => !document.querySelector(`[data-state=${state}] > .box`));
  return [...boxes.map(describe), ...radios.map((input) => input.value), ...states.map((state) => `no ${state} box`)];
}

async function unpictured() {
  setInclude(true);
  const outlines = await edges();
  const icons = items.map((item) => item.node.querySelector(".node-icon"));
  await loaded(icons.filter(Boolean));
  const wrong = items.filter((item, i) => {
    const own = item.group ? data.icons.groups[item.key] : data.pictures[item.key];
    const [img, look] = [icons[i], icons[i] && getComputedStyle(icons[i])];
    if (!own) return !!img;
    return !img || img.naturalWidth !== 48 || img.getAttribute("src") !== iconFile(own)
      || img.previousElementSibling !== item.node.querySelector(".box") || img.nextElementSibling !== item.label
      || look.width !== "44px" || look.height !== "44px" || Math.abs(parseFloat(look.borderTopWidth) - 2) >= 1
      || look.borderTopStyle !== "solid"
      || look.borderTopColor !== (item.group ? "rgba(0, 0, 0, 0)" : outlines.get(`${own.kind} ${own.reach}`));
  }).map((item) => item.key);
  setInclude(false);
  return outlines.size === 9 ? wrong : [...wrong, "colour_key.csv"];
}

function findLooks() {
  const lens = () => getComputedStyle($("find").parentElement, "::after");

  const field = getComputedStyle($("find"));
  const breadth = box($("find")).width;
  const empty = at(field.borderImageSource, "ui/buttons/textfield_9slice") && field.borderImageSlice === "15 fill"
    && field.borderImageWidth === "15px" && /^repeat( repeat)?$/.test(field.borderImageRepeat)
    && !rendered($("clearFind")) && lens().content !== "none" && picture(lens(), "ui/buttons/search")
    && Math.abs(breadth - Math.min(325, $("find").closest(".find").clientWidth - 96)) < 1;
  type(nameOf(items.find((item) => !item.group)));
  const typed = rendered($("clearFind")) && lens().content === "none" && box($("find")).width === breadth && beside()
    && document.querySelector(".node.found") && getComputedStyle($("found")).textAlign === "right"
    && picture(getComputedStyle($("clearFind")), "ui/buttons/clear_search");
  type("qqqqzzzzqqqq");
  const lost = box($("find")).width === breadth && beside();
  $("clearFind").click();
  const cleared = lost && $("find").value === "" && !document.querySelector(".node.found") && !rendered($("clearFind"))
    && document.activeElement === $("find") && getComputedStyle($("find")).outlineStyle === "none";
  return { empty, typed, cleared };
}

const hover = (el, x, y) => el.dispatchEvent(new PointerEvent("pointermove", {
  bubbles: true, pointerType: "mouse", clientX: x, clientY: y,
}));

function tipLooks() {
  const [cx, cy] = [box(items[0].node).left + 5, box(items[0].node).top + 5];
  hover(items[0].node, cx, cy);
  const tip = box($("tip"));
  const reach = innerWidth > 2560 || innerHeight > 1440 ? 48 : 32;
  const tipped = !$("tip").hidden && $("tip").textContent === ui().nodeTip
    && getComputedStyle($("tip")).backgroundColor === "rgb(215, 179, 148)"
    && tip.left >= 3.5 && tip.right <= innerWidth - 3.5
    && (Math.abs(tip.left - cx - reach) < 1 || Math.abs(tip.right - innerWidth + 4) < 1)
    && (Math.abs(tip.top - cy - reach) < 1 || Math.abs(tip.bottom - cy + 8) < 1);
  hover($("count"), 0, 0);
  $("optionsButton").click();
  hover($("include"), box($("include")).left + 5, box($("include")).top + 5);
  const hinted = !$("tip").hidden && $("tip").textContent === ui().includeHint && $("options").contains($("tip"))
    && box($("includeHint")).width <= 1 && $("include").getAttribute("aria-describedby") === "includeHint";
  $("options").close();
  $("tooltips").click();
  hover(items[0].node, cx, cy);
  const silent = $("tip").hidden && $("tooltips").getAttribute("aria-checked") === "false"
    && (recall("tooltips") === "false" || attempt(() => localStorage) === null);
  keyDown($("tooltips"), " ");
  return { tipped, hinted, silent: silent && $("tip").hidden && $("tooltips").getAttribute("aria-checked") === "true" };
}

function simpleSwitch() {
  tap(items.find((item) => !item.group && size(item.set) > 0).node);
  $("optionsButton").click();
  const before = { pictures: pictures(), spot: simpleSpot(), basics: picturesOn() };
  before.basics &&= civLinks() === $("civs").children.length;
  $("simple").click();
  const title = [...document.querySelector("h1").children].filter(rendered).map((el) => el.textContent);
  const problems = [
    ...need(before.basics, "no pictures or links before ticking"),
    ...need(simpleTicked(true), "the box is not ticked"),
    ...pictures().slice(0, 3).map((name) => `${name} is left`),
    ...need(simpleSpot() === before.spot, `ticking moved the box from ${before.spot} to ${simpleSpot()}`),
    ...need(civLinks() === 0, "links are left"),
    ...need(recall("simple") === "true" || attempt(() => localStorage) === null, "the choice is not remembered"),
    ...need(same(title, [ui().title]), "the title is short"),
  ];
  $("simple").click();
  problems.push(
    ...need(simpleTicked(false), "the box is not unticked"),
    ...need(same(pictures(), before.pictures), "not every image came back"),
    ...need(simpleSpot() === before.spot, `unticking moved the box from ${before.spot} to ${simpleSpot()}`),
    ...need(civLinks() === $("civs").children.length, "the links did not come back"),
  );
  return problems;
}

export async function pictureTests() {
  reset();
  setSimple(false);
  pictureLooks();
  const { partial, other } = fixtures();
  tap(partial.node);
  keyDown(other.node, "x");
  const boxes = wrongBoxes();
  reset();
  const icons = await unpictured();
  check("options: without Simple UI, every checkbox and radio button shows its picture from its sheet, empty, ticked, "
    + "crossed or chosen, and every item and top-level group its icon between its box and name, outlined as "
    + "colour_key.csv says", !boxes.length && !icons.length, [...boxes, ...icons].join(", "));
  const looks = { ...findLooks(), ...tipLooks() };
  check("options: without Simple UI, the Find box shows a search icon or a cross that clears it, and a tooltip "
    + "follows the mouse over the tree, and over Include with its description, unless Tooltips is unticked",
    Object.values(looks).every(Boolean), Object.entries(looks).map(([name, ok]) => `${name} ${ok}`).join(", "));
  reset();
  expect("options: Simple UI takes away every image and civilisation link without moving its box, and gives them back",
    simpleSwitch());
  reset();
  setSimple(true);
}

