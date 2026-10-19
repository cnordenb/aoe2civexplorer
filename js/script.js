import { params, load, useData, loadLanguage, loadLanguages, preferredLanguage } from "./datahandler.js";
import { start, runUpdate, showLoadError } from "./ui.js";

load("data.json").then((raw) => {
  useData(raw);
  return params.has("test") || params.has("update") ? loadLanguages() : loadLanguage(preferredLanguage()).catch(() => null);
}).then(() => {
  start();
  if (params.has("test")) return import("./tests/run.js").then(({ runTests }) => runTests());
  if (params.has("update")) return runUpdate();
  return null;
}).catch((error) => {
  showLoadError();
  if (params.has("test")) import("./tests/run.js").then(({ loadFailed }) => loadFailed(error));
  throw error;
});
