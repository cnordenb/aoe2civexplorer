import { data, params, load, fill, attempt, recall, remember, language } from "../datahandler.js";
import { include } from "../model.js";
import { clone, setLanguage, setInclude, openReport, report } from "../ui.js";
import { root, results, check, codes, pick, reset, fixtures } from "./helpers.js";
import { scripts, sourceTests, dataTests, updaterTests } from "./static.js";
import { behaviourTests } from "./behaviour.js";
import { menuTests, languageTests, optionTests, spacingTests } from "./interface.js";

const LIMIT = 100;
const merge = (runs) => {
  const merged = new Map();
  for (const { where, results: run } of runs) {
    for (const { name, ok, detail } of run) {
      if (!merged.has(name)) merged.set(name, { name, ok: true, failures: [] });
      if (ok) continue;
      merged.get(name).ok = false;
      merged.get(name).failures.push(detail ? `${where}: ${detail}` : where);
    }
  }
  return [...merged.values()].map(({ name, ok, failures }) => ({ name, ok, detail: failures.slice(0, 3).join("; ") }))
    .sort((a, b) => a.name.split(":")[0].localeCompare(b.name.split(":")[0]));
};

function framed(size) {
  return new Promise((resolve) => {
    const frame = clone("frameTemplate");
    let timer = 0;
    const listen = (e) => {
      if (e.source === frame.contentWindow) done({ where: e.data.where ?? `the ${size} window`, results: e.data.results });
    };
    const done = (run) => {
      removeEventListener("message", listen);
      clearTimeout(timer);
      frame.remove();
      resolve(run);
    };
    timer = setTimeout(() => done({ where: `the ${size} window`, results: [{ name: "the tests finished", ok: false, detail: "no answer" }] }), 300000);
    addEventListener("message", listen);
    frame.classList.add(size);
    frame.title = data.tools.frameTitle;
    frame.src = `index.html?test&frame=${size}`;
    document.body.append(frame);
  });
}

export function loadFailed(error) {
  root.dataset.tests = "failed";
  if (params.has("frame")) parent.postMessage({ results: [{ name: "the page loaded", ok: false, detail: error.message }] }, "*");
}

export async function runTests() {
  const before = { language, include, url: location.href, stored: recall("language"), included: recall("include") };
  if (include) setInclude(false);
  const where = `${innerWidth} by ${innerHeight}`;
  try {
    if (!params.has("frame")) {
      const [page, sheet, files] = await Promise.all([load("index.html"), load("style.css"), scripts()]);
      sourceTests(page, sheet, files);
      dataTests();
      updaterTests();
    }
    pick(codes()[0]);
    const sample = fixtures();
    await behaviourTests(sample);
    menuTests(sample);
    codes().forEach((code) => languageTests(code, sample));
    spacingTests(sample);
    optionTests();
  } catch (error) {
    check("the tests ran to the end", false, error.stack || error.message);
  }
  reset();
  if (include !== before.include) setInclude(before.include);
  setLanguage(before.language);
  attempt(() => history.replaceState(history.state, "", before.url));
  remember("language", before.stored);
  remember("include", before.included);
  if (params.has("frame")) {
    root.dataset.tests = results.every((result) => result.ok) ? "passed" : "failed";
    parent.postMessage({ where, results }, "*");
    return;
  }
  const runs = [{ where, results }];
  for (const size of ["small", "phone", "tall"]) runs.push(await framed(size));
  const merged = merge(runs);
  merged.push({ name: `rules: there are at most ${LIMIT} tests`, ok: merged.length + 1 <= LIMIT, detail: `${merged.length + 1} tests` });
  const failed = merged.filter((result) => !result.ok);
  root.dataset.tests = failed.length ? "failed" : "passed";
  const tools = data.tools;
  openReport(tools.testTitle, fill(failed.length ? tools.testFailed : tools.testPassed, {
    failed: failed.length, n: merged.length, colours: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    windows: new Intl.ListFormat("en").format(runs.map((run) => run.where)),
  }));
  for (const result of [...failed, ...merged.filter((r) => r.ok)]) report(fill(result.ok ? tools.pass : tools.fail, result));
}
