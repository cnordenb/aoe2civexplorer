import { params, load, useData, loadLanguage, loadLanguages, preferredLanguage } from "/js/datahandler.js";
import { start, runUpdate, showLoadError } from "/js/ui.js";

load("data.json").then((raw) => {
  useData(raw);
  return params.has("test") || params.has("update") ? loadLanguages() : loadLanguage(preferredLanguage()).catch(() => null);
}).then(() => {
  start();
  if (params.has("test")) return import("/js/tests/run.js").then(({ runTests }) => runTests());
  if (params.has("update")) return runUpdate();
  return null;
}).catch((error) => {
  showLoadError();
  if (params.has("test")) import("/js/tests/run.js").then(({ loadFailed }) => loadFailed(error));
  throw error;
});
