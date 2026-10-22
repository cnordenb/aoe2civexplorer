# AoE2 Civ Explorer: maintainer's guide

1. [Updating Civ Explorer after a game patch](#updating-civ-explorer-after-a-game-patch)
2. [How the code works](#how-the-code-works)
   - [Files and folders](#files-and-folders)
   - [UML diagram](#uml-diagram)
   - [The data](#the-data)
   - [How marking works](#how-marking-works)
   - [Simple UI and the pictures](#simple-ui-and-the-pictures)
   - [Assets](#assets)
   - [Tests](#tests)
   - [Rules for changing the code](#rules-for-changing-the-code)

## Updating Civ Explorer after a game patch

After a patch, [aoe2techtree.net](https://aoe2techtree.net/) publishes the game's new data. The page has an updater
built in: it fetches that data, tells you what changed, and gives you new data files to save. You need a browser, a
text editor such as Visual Studio Code, and about ten minutes. You do not need to know how to program.

1. **Wait for aoe2techtree.net.** Its footer says which game update its data comes from. Wait until that matches the
   new patch.
2. **Open the page on your computer.** A browser will not let a page read files straight from your disk, so the
   folder has to be served. In Visual Studio Code with the Live Server extension, open the project folder, right-click
   `index.html` and choose **Open with Live Server**. The page opens at an address such as
   `http://127.0.0.1:5501/index.html`. You can also use the published page's address instead.
3. **Run the updater.** Add `?update` to the address, for example `http://127.0.0.1:5501/index.html?update`. A window
   called **Update the data files** fetches the new data, which takes a few seconds, and lists what it found. Nothing
   is changed yet.
4. **Read the report.** Most lines need nothing from you. These do:
   - *In the source data, but not yet in the tree: …* The patch added a building, unit or technology. Put it in the
     tree (step 5), or add its name to `ignore` in `data.json` to leave it out.
   - *In the tree, but not in the source data: …* or *In the tree more than once: …* Fix the tree (step 5). The
     updater stops until you do.
   - *No civilisation has: …* It was probably removed from the game. Consider removing it from the tree.
   - *New icon for …: …* If the file it names is not in the project yet, copy it from the `img` folder of
     [aoe2techtree's repository](https://github.com/SiegeEngineers/aoe2techtree): `img/Unit/912.png` goes to
     `assets/images/icons/nodes/unit/912.png`, and the same for `Building` and `Tech`.
   - *New civilisation: …* Its names are added for you. Add its icon to `assets/images/icons/civs/`, named after its
     English name in lower case, such as `celts.png`.
   - *… has no text for: …* A language file is missing a sentence or a heading. Add it under `text` in that file (see
     [The data](#the-data)).
   - *New name in … for …: …* Nothing, unless the new name is wrong. Then add the right one to `overrides` in that
     language's file, with the English name on the left, such as
     `"Heavy Mounted Crossbowman": "Schwerer berittener Armbrustschütze"` in `locales/de.json`. English corrections
     go in `overrides` in `data.json`. Reload the `?update` page afterwards.
5. **Change the tree, if the report asked you to.** Open `data.json` and find `"tree"`. It reads like an outline:
   each entry is a row of the left pane, and `"kids"` lists the rows under it.

   ```json
   {"item": "Stable", "kids": [
     {"item": "Scout Cavalry", "kids": [
       {"item": "Light Cavalry", "kids": [
         {"item": "Hussar"}
       ]}
     ]},
   ```

   - `"item"` is the English name, **exactly** as the report wrote it.
   - Put a building at the top or in a group, its units and technologies under it, and each upgrade under the unit
     or technology it upgrades, as Light Cavalry is under Scout Cavalry. Walls and towers in Fortifications are
     lines too, as the Keep is under the Guard Tower. Marking works along these lines (see
     [How marking works](#how-marking-works)).
   - A new unique item goes into a Unique group, in alphabetical order: a unique unit under the building that
     trains it, a unique technology under the Castle, and a unique building into Economy or Military.
   - Every entry in a list is followed by a comma, except the last one. Visual Studio Code underlines mistakes in red.

   Reload the `?update` page. The report should no longer mention those items.
6. **Download the new files.** At the bottom of the report is a link for each file that changed: always
   **Download data.json**, and one for each language file that changed, such as **Download locales/de.json**. Save
   each over the old file of the same name.
7. **Run the tests.** Open the page with `?test` instead, such as `http://127.0.0.1:5501/index.html?test`, and wait
   about half a minute. A window then says **All … tests passed**, or names the tests that failed by their number in
   `TESTS.md`, each with what is wrong and where.
8. **Publish.** Commit the changed files and push them, for example with GitHub Desktop. GitHub runs the tests again
   in several window sizes, in light and dark colours; a green tick in the repository's **Actions** tab means they
   all passed.

## How the code works

The page is plain HTML, CSS and JavaScript. There is nothing to install and nothing to build: the files in the
project are exactly what a visitor's browser downloads. The most important idea is that **all facts and all text
live in `data.json` and the language files**. The code never names a unit, a civilisation or a sentence, which is
why a game update changes only those files, and sometimes adds an icon.

### Files and folders

| File or folder | What it holds |
| --- | --- |
| `index.html` | The structure of the page. It holds no text of its own. |
| `style.css` | How the page looks, for big and small screens, light and dark colours, with or without pictures. |
| `script.js` | Where the page starts. The rest of the code is in `js/`. |
| `js/` | The scripts; see [UML diagram](#uml-diagram). |
| `js/tests/` | The tests, loaded only when the address ends in `?test`; see [Tests](#tests). |
| `data.json` | The data and the English text; see [The data](#the-data). |
| `locales/` | One file per other language, such as `de.json` for German. |
| `assets/` | Pictures and fonts, used only when Simple UI is off; see [Assets](#assets). |
| `documentation/` | This guide, `RULES.md`, `REQUIREMENTS.md`, `TESTS.md`, `DEVLOG.md` and `code_docu.pdf`. |
| `README.md` | Introduces the project. |
| `.github/workflows/tests.yml` | Tells GitHub to run the tests on every push. |

`code_docu.pdf` describes every function in the code, one by one.

### UML diagram

Each arrow points from a script to a script it uses. `+` marks what a script shares with others, `-` what it keeps to
itself.

```mermaid
classDiagram
  direction TB
  class script {
    <<module>>
  }
  class optionshandler {
    <<module>>
    +start()
    +setLanguage(code)
    +setInclude(on)
    +setRegional(on)
    +setSimple(on)
    +tick(id, on)
    -choose(code)
  }
  class nodetree {
    <<module>>
    +startTree()
    +setOpen(item, open)
    +update()
    +find()
    +replant()
    +dress(item)
    -toggle(item, kind)
  }
  class stringbuilder {
    <<module>>
    +clone(id)
    +simple()
    +writeTexts()
    +label()
    +listCivs(marked)
    +listFilters()
  }
  class model {
    <<module>>
    +items
    +rebuild()
    +mark(item, kind)
    +fit()
    +filtersOf()
    +chipName(item, kind)
  }
  class datahandler {
    <<module>>
    +data
    +useData(raw)
    +useLanguage(code)
    +preferredLanguage()
    +setOf(rule)
    +civsOf(set)
    +recall(key)
    +remember(key, value)
    +fetchUpdate()
  }
  class tests {
    <<js/tests>>
    +runTests()
  }
  class pictures {
    <<module>>
    +view
    +setView(choice)
    +startPictures()
    -wireTip()
  }
  class report {
    <<module>>
    +runUpdate()
    +openReport(title, status)
    +report(line)
  }
  script ..> optionshandler
  script ..> stringbuilder
  script ..> report
  script ..> pictures
  script ..> datahandler
  script ..> tests : only with ?test
  optionshandler ..> nodetree
  optionshandler ..> stringbuilder
  optionshandler ..> model
  optionshandler ..> datahandler
  nodetree ..> stringbuilder
  nodetree ..> model
  nodetree ..> datahandler
  stringbuilder ..> model
  stringbuilder ..> datahandler
  pictures ..> optionshandler
  pictures ..> nodetree
  pictures ..> stringbuilder
  pictures ..> datahandler
  report ..> stringbuilder
  report ..> datahandler
  model ..> datahandler
  tests ..> optionshandler
  tests ..> nodetree
  tests ..> stringbuilder
  tests ..> pictures
  tests ..> report
  tests ..> model
  tests ..> datahandler
  note for datahandler "reads data.json and locales/"
```

- **`script.js`** turns Simple UI on or off as the visitor last chose, loads `data.json` and the visitor's language,
  and starts the page. With `?test` it loads the tests, and with `?update` the updater.
- **`js/datahandler.js`** looks after the data: loading `data.json` and the language files, the chosen language,
  which civilisations have what, the visitor's saved choices, and the updater's fetching and file writing.
- **`js/model.js`** holds the tree and its rules: which items are shown, how marks pass on (see
  [How marking works](#how-marking-works)), which civilisations fit, and what **Filters** shows. It never touches the
  page.
- **`js/stringbuilder.js`** writes the page's text: the fixed texts, the chosen language's texts, the names in the
  tree, the list of civilisations and **Filters**.
- **`js/nodetree.js`** draws the tree and handles it: opening and closing, counts, marking by click, touch and key,
  **Find**, and the buttons above it.
- **`js/optionshandler.js`** runs the Options window: the language menu, the Include boxes and Simple UI.
- **`js/pictures.js`** holds what only the pictures need: the civilisations as a list or as tiles, and the tooltip.
- **`js/report.js`** shows the report window of the updater and the tests.

A script only uses the scripts below it in this order: `datahandler.js`, `model.js`, `stringbuilder.js`,
`nodetree.js`, `optionshandler.js`. Keep it so, so that the arrows never go round in a circle.

### The data

`data.json` is a text file in JSON format. Its parts:

- `source`: where the data comes from and when it was fetched, and Microsoft's notice for the footer.
- `languages`: the 17 languages, English first. Each has its `name`, its `tag` (such as `pt-BR`) and two settings the
  updater uses to tidy the game's names.
- `civs`: the civilisations, by their English names.
- `icons`: where the icons are, the tab icon, and the civilisations whose icon has another name than theirs.
- `tree`: the rows of the left pane, where a group can be marked `"unique": true` or `"lines": true` (see
  [How marking works](#how-marking-works)). **Edited by hand.**
- `availability`: which civilisations have each item. **Written by the updater; never edit it.**
- `pictures`: each item's icon, and whether it is common, regional or unique. **Written by the updater.**
- `ignore`: names from the game that the page leaves out. **Edited by hand.**
- `overrides`: corrections to English names. **Edited by hand.**
- `tools`: the updater's and the tests' messages, in English only.
- `text`: the English text: `ui` holds the page's sentences, `groups` the headings in the tree, and `civs` and `items`
  the names, which the updater writes.

Each file in `locales/` holds `overrides` and `text` for one more language. A visitor's browser only downloads
`data.json` and the file of the language it shows.

When you change a sentence under `text` → `ui`:

- Keep the words in braces, such as `{n}` or `{name}`. The page fills them in, and the tests check that every
  language has the same ones as English.
- A text with a count, such as `"compatible"`, has a form for each kind of number: `"one"`, `"few"`, `"many"` and
  `"other"`. English needs `"one"` and `"other"`; Polish and Russian also need `"few"` and `"many"`. Every count
  needs `"other"`.

To add a language, it must exist on aoe2techtree.net, as the names come from there:

1. Add it to `languages` in `data.json`, copying `spaces` and `mergeHyphens` from a similar language.
2. Create `locales/<code>.json`, such as `locales/pt.json`, as `{"overrides": {}, "text": {"ui": …, "groups": …}}`,
   with `ui` and `groups` copied from `data.json` and translated.
3. Run the updater, download its files, and run the tests. The updater fills in all the names.

### How marking works

A visitor marks an item **must have** with a click and **must lack** with a right-click, a long press or X. Where an
item sits in the tree decides what else its mark reaches:

- An item with no other item above it, only groups or nothing, is a **building**, such as the Barracks. Marking a
  building or a group marks everything in it, and opens it all.
- An item under another item is a **unit or technology**, often the start of a line of upgrades. Its mark passes
  down that line, until it forks, but only to the items that as many civilisations have (requirements 29 and 30):
  marking Militia (52 civilisations) also marks Man-at-Arms (52), but not Long Swordsman (51).
- The items in a group marked `"lines": true` count as units and technologies too. That group is Fortifications,
  whose walls and towers are lines of upgrades (requirements 24, 25 and 30): marking the Watch Tower (55) does not
  mark the Guard Tower (51).
- A mark never passes up: marking Champion marks Champion only, and marking everything in a building leaves the
  building itself unmarked, with a dash in its box.
- Marking opens the item down to its first fork, and every row the mark reached.
- In **Filters**, a fully marked building or group with something under it reads "Full", such as "Full Market". A
  line is named after its deepest item marked must have, such as "Champion" or "Keep".

Some items are left out of the tree unless the visitor ticks **Include Unique and Universal** in Options: the groups
marked `"unique": true` (Unique Units, Unique Technologies and Unique Buildings), and the items that every
civilisation has or only one has, which the page works out by itself. Unticking **Include Regionals** also leaves out
the items aoe2techtree calls regional, such as the Eagle Scout.

### Simple UI and the pictures

**Simple UI**, a box in the Options window, turns every picture off: the page then uses no images at all, not even
the tab icon, and a visitor who chose it never downloads a picture or a font. The page's look and its accessibility
rules are the ones `REQUIREMENTS.md` and WCAG 2.2 AAA ask for with Simple UI on (requirement 0, Rule 22); the way
marking works is the same in both modes.

It works through one class: with Simple UI off, `<html>` has the class `pictures`. Every rule in `style.css` that
uses a picture or a font starts with `.pictures`, so none of them applies with Simple UI on. The icons in the tree and
the list are only made while the class is there, and the tab icon in `index.html` is empty (`data:,`) until
`js/optionshandler.js` sets it with Simple UI off.

With the pictures on, the page also looks a little different: the title is the short "Civ Explorer", the legend is
hidden as the tooltip explains the same, the Find box comes first, Include's description shows as a tooltip, the
civilisations can be shown as tiles and link to their pages on aoe2techtree.net, and the mouse cursor is a sword.

### Assets

| Folder | Holds |
| --- | --- |
| `assets/images/ui/backgrounds/` | The parchment behind the page in four sizes, the Options window's parchment and the title's frame. |
| `assets/images/ui/buttons/` | The cogwheel, the text buttons, the Find box and its search and clear icons. |
| `assets/images/ui/checkboxes/` | The checkboxes and the radio buttons. |
| `assets/images/ui/cursors/` | The mouse cursors. |
| `assets/images/ui/panels/` | The panes' frames and the box of a civilisation tile. |
| `assets/images/icons/civs/` | The civilisations' icons. |
| `assets/images/icons/nodes/` | The tree's icons, in `building/`, `unit/`, `tech/` and `misc/`, and `colour_key.csv`. |
| `assets/images/favicon.ico` | The tab icon. |
| `assets/fonts/` | Georgia, Times New Roman Bold and Trajan Pro Bold, used only with the pictures. |

- Most pictures come in two sizes: `_sd` for windows up to 1920 by 1080, and `_4k` for bigger windows and sharp
  screens. The parchment comes as `fhd`, `qhd`, `uhd` and `ultrawide`, and the browser downloads only the one that
  suits the window.
- A picture with several states, such as a checkbox, holds them all in one sheet: rows for empty, ticked and
  crossed, and columns for normal, under the mouse and pressed. `style.css` shows the right part.
- To replace a picture, save the new one under the same name, as WebP and with the same proportions. Names use only
  lower-case letters, digits and underscores, and GitHub refuses other names and formats than WebP, PNG and ICO. If
  the parchment's frame is in another place, change `--left`, `--right`, `--top` and `--bottom` in the
  `.pictures body` rule of `style.css`: each is a position in the picture, divided by its width or height. Look at
  the page to check.
- The tree's icons are copied from aoe2techtree's repository and keep its file numbers. `pictures` in `data.json`
  says which file each item uses. The colour of an icon's outline depends on the item's kind and reach, as
  `colour_key.csv` says, and the same colours are copied into `style.css`: change both together. The tests compare
  them.
- The civilisations' icons are named after the civilisation in lower case. Where the file has another name, such as
  `inca.png`, `icons` in `data.json` says so.

### Tests

Open the page with `?test` to run the tests in your browser. They run in three rounds: functional tests,
accessibility tests and maintainability tests, in the order `TESTS.md` lists them, and the report names each by its
number there. GitHub runs them on every push, at four window sizes in light and dark colours, and also checks the
file names and that no folder holds too many files.

| File in `js/tests/` | Tests |
| --- | --- |
| `run.js` | Runs the rounds, shows the report, and checks that there are at most 100 tests. |
| `helpers.js` | No tests: shared helpers, and the sample items the tests use, picked from the data so that the tests survive game updates. |
| `behaviour.js` | Marking, **Filters**, counts, opening and closing, the keyboard, and **Find**. |
| `interface.js` | The language menu, every language, the Options window, and the runs of the accessibility audit. |
| `pictures.js` | The pictures, with Simple UI off. |
| `audit.js` | The accessibility audit (contrast, focus, sizes, names and more), which the other files run in many states. |
| `static.js` | The files themselves: the rules for the code, and mistakes in `data.json` and the language files. |

There may be at most 100 tests. When you add, change or remove one, update `TESTS.md`. Tests cannot prove everything
about accessibility, so after bigger changes also try the page with Simple UI on, with only a keyboard, at 400% zoom
and with a screen reader.

### Rules for changing the code

`RULES.md` has the full list, and the tests check most of it.

- HTML only in `index.html`, CSS only in `style.css`, JavaScript only in `script.js` and `js/`, and facts and text
  only in `data.json` and `locales/`.
- No file over 400 lines of code, no function over 60, and no line of a script over 120 characters. No folder over
  7 files, except `assets/` and `locales/`; the main folder may hold 8. `js/` and `js/tests/` are full, so move code
  into a script with room, merge two scripts, or start a folder inside `js/`.
- No comments in the code, and a blank line before and after every function.
- No pictures outside `assets/` and `.pictures` rules, and no sounds, animations, libraries, build steps or Python.
- No button, box or other control may move on the screen while the visitor uses it, and the page itself never
  scrolls with every branch closed.
- `REQUIREMENTS.md` defines the page, and only the chief developer may change it.
- Record what you change, and why, in `DEVLOG.md`.
