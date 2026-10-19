# Development log

## 2026-10-18: translations, and making the project follow RULES.md

### What changed

- **One file became four.** The old `index.html` held its data, styles and script inline. It is now split, as
  rules 1 and 2 ask:
  - `index.html` holds only structure. All repeated markup, such as tree rows, filter buttons, list items and
    language choices, is in `<template>` elements.
  - `style.css` holds all styles.
  - `script.js` holds all behaviour.
  - `data.json` holds every fact and every piece of text.
- **All comments are gone** (rule 7). What they explained now lives in `MAINTAINER.md`.
- **Translations.** A language menu at the top right offers the same 17 languages as aoe2techtree.net, in the same
  order and under the same `?lng=` codes (`en`, `zh`, `tw`, `fr`, `de`, `hi`, `it`, `jp`, `ko`, `ms`, `pl`, `ru`, `es`,
  `mx`, `tr`, `vi`, `br`), so a link such as `index.html?lng=de` works the same way. Taken from how aoe2techtree.net
  does it:
  - The choice is remembered in the address (`?lng=`) and in local storage.
  - On a first visit the page picks the best match from the browser's languages, or else English.
  - Names of civilisations, buildings, units and technologies come from the game's own text, through
    aoe2techtree.net's locale files.
- **Where this project differs from aoe2techtree.net:**
  - It uses proper language tags (`ja`, `zh-TW`, `pt-BR` and so on) in `lang`, where aoe2techtree.net writes its
    own codes such as `jp`. The tags matter for screen readers, and for WCAG 3.1.1 and 3.1.2.
  - It changes language in place, without reloading, so marks and open branches are kept.
  - It uses a menu of buttons rather than a `<select>`. With a `<select>` that acts on change, the language would
    switch on every arrow key press while someone moves through the list. That is a WCAG 3.2.2 and 3.2.5 failure
    (technique F37).
- **Text that changes with the language:**
  - The `lang` of the page, and of every language choice in the menu.
  - Plural forms through `Intl.PluralRules`, including Polish and Russian "few" and "many".
  - Numbers, the footer's month (`Intl.DateTimeFormat`), and the sort order of the civilisation list
    (`Intl.Collator`).
  - Search ignores case, accents and punctuation in every script.
- **Text I rewrote so it reads clearly in translation.**
  - "techs" and "Civs" are now written out in full, because WCAG 3.1.4 (AAA) asks for abbreviations to be
    expanded.
  - The count after each tree item is read out as "52 civilisations" in each language.
- **The data now comes from aoe2techtree.net automatically.** Before, which civilisation has what was typed in by
  hand.
  - I compared all 465 items of the old hand-made tree with aoe2techtree.net's per-civilisation trees, and every one
    matched exactly.
  - The page's built-in updater, `index.html?update`, now produces `data.json` from that source. It keeps the
    hand-made parts: the tree's shape, the page's text, `overrides` and `ignore`.
- **Four items were missing from the old tree and are now in it:** the Pasture, and Domestication, Pastoralism and
  Transhumance (all Khitans only). They sit next to the Farm and under the Mill.
- **Visible changes to English names,** because English names now come from the game's text like every other
  language:
  - "Warships" is now "Medium Warships".
  - "Ming-Kuang Armor" is now "Ming Guang Armor".
  - "Red Cliff Tactics" is now "Red Cliffs Tactics".
  - "Incas" is now "Inca", and "Mayans" is now "Maya".
  - "Heavy Demolition Ship" is kept through an override, because the game's tech-tree label shortens it to
    "Heavy Demo Ship".
- **Name corrections in `overrides`.** The game's tech-tree labels are sometimes shortened ("E.", "Arm.", "dem.").
  The updater then falls back to the full name in the item's help text. In Polish, Russian and German that full
  name is in the accusative case, so 13 names have hand corrections in `overrides` (de, pl, ru, mx, tw, vi, en),
  plus "Корабль-дракон", which the Russian game text leaves in English.
- **Tests (rule 4)** live in `script.js` and run with `index.html?test`. There are about 6,000 checks:
  - The rules themselves: no comments, no CSS or HTML in `script.js`, no game data in `script.js`, no images,
    sounds or animations, and no dependencies.
  - The completeness and consistency of `data.json`.
  - Marking with click, Space, X, right-click, long press and the menu key; filter buttons; Find; Expand and
    Collapse all; keyboard movement in the tree and the menu; and the language menu.
  - For every language: all text present, no placeholders left over, the tree named and the civilisations sorted
    in that language.
  - Accessibility, in several states and every language:
    - text contrast of 7:1 (4.5:1 for large text), and 3:1 for control borders;
    - 44 by 44 pixel targets;
    - a 3px focus outline with 3:1 contrast, and nothing covering what has focus;
    - names for every control, with the visible label inside the name;
    - valid ARIA references, headings and landmarks;
    - 1.5 line spacing, no justified text, no sideways overflow, and the WCAG 1.4.12 text spacing test;
    - no page scrolling, and on the landing page nothing scrolling at all where the screen allows.
  - The page also tests itself inside 320 by 256 (400% zoom), 360 by 640 and 390 by 844 frames.
  - I checked the tests by breaking a copy of the page in 11 ways: contrast, focus outline, a transition, sideways
    overflow, a comment, a missing translation, an inline style, target size, the filter logic, page scrolling and
    an image. Every break was caught.
- **Continuous integration.** `.github/workflows/tests.yml` runs the tests on every push and pull request:
  - It uses the Chrome that GitHub's Ubuntu runners already have, in light and dark colours, at four window sizes.
  - It checks that the repository holds only the allowed files.
  - It uses no GitHub Actions at all, not even `actions/checkout` (rule 14).
- **No page scrolling (rule 12).** The document never scrolls.
  - When the page opens, with every branch closed, it fits on desktop, laptop, tablet and 390 by 844 phone
    screens with nothing scrolling.
  - On smaller screens the panes scroll inside themselves.
  - On very short screens, such as 400% zoom, the content area below the header scrolls.
- **Layout.** The language button stays at the top right. On phones the tree pane gets the room its rows need, and
  the civilisation pane takes the rest.
- **Before the data has loaded, the page shows nothing,** instead of unlabelled buttons. Without JavaScript only the
  `<noscript>` message shows.
- **`MAINTAINER.md`** explains, step by step, how to update the page after a patch (rule 5).
- **`README.md`** describes the page and points to `MAINTAINER.md`.

### Decisions where rules met each other

- **Rule 1 and rule 2.** A few texts stay in `index.html` in English because they must exist before or without
  JavaScript:
  - the `<title>` ("AoE2 Civ Explorer", which a valid page must not leave empty);
  - the meta description;
  - the `<noscript>` message and the "could not load its data" message;
  - the "×" on filter buttons.

  The `<title>` is a proper name, so leaving it untranslated does not break WCAG 3.1.2.
- **Rule 2 and rule 4.** "All JavaScript in `script.js`" meant the tests and the updater had to live there too, so
  every visitor downloads them, about 40 KB more (roughly 11 KB once compressed). They run only with `?test` or `?update`. The CI step is shell
  commands in YAML, not JavaScript.
- **Rule 3 and rule 12.** At 400% zoom (320 by 256), WCAG 1.4.10 needs vertical scrolling: nothing can fit. So the
  document still never scrolls, but the content area below the header does, and the header with the title and the
  language menu stays put.
- **Rules 13, 14 and 15.** The update tool is not a build step: it refreshes the data, and runs in the browser
  from `script.js`. The Python tool I first wrote, and the Python tests, were removed when rule 15 arrived.
- **Testing small screens.** Chrome's current headless mode will not make a window narrower than 500 pixels. The tests
  therefore load the page into 320, 360 and 390 pixel frames themselves (a template in `index.html`, sizes in
  `style.css`), so CI covers 400% zoom without any extra download.

### Questions for you

1. **Translations.** I wrote the page's own text in the 16 other languages: the title, buttons, hints, group
   headings such as "Economy", and the counts. Names of game items come from the game. Please have native speakers
   check my text, especially Hindi, Malay, Vietnamese, Turkish, Korean and Japanese. German uses the game's own
   word "Völker" for civilisations, and "Spezialeinheiten" for unique units.
2. **English names.** Should the English page keep "Incas" and "Mayans" instead of the game's current "Inca" and
   "Maya"? The same question applies to "Warships" instead of "Medium Warships". Either can be set with two lines
   in `overrides`.
3. **Title.** The tab title stays "AoE2 Civ Explorer", as you last set it, and is not translated. The heading on the
   page is your longer title, and it is translated. Is that what you want?
4. **Rule 12 on small phones and at high zoom.** On a 360 by 640 phone the tree's five rows do not all fit next to
   the rest, so the tree pane scrolls inside itself. At 400% zoom the content area scrolls. The document itself
   never does. Is that acceptable, or should the phone layout be squeezed further? Two ways to squeeze it: put Find
   and the buttons on one row, or shorten the legend.
5. **First visit.** Should the page follow the browser's language on a first visit, as it does now, or always
   start in English, as aoe2techtree.net does?
6. **Publishing.** Is the page published, for example on GitHub Pages? `MAINTAINER.md` says the updater can also
   be run on the published address.

### Obstacles met, and how they were solved

- **Rule 15 came part-way through.** A Python update tool and a Python test plan were replaced by the updater and
  the tests in `script.js`. The JavaScript updater was checked against the Python output: it produces a `data.json`
  that is identical byte for byte.
- **Browsers will not `fetch()` a `file://` address.** `script.js` uses `XMLHttpRequest`, and CI starts Chrome with
  `--allow-file-access-from-files`. For people, `MAINTAINER.md` explains how to use a local server such as Live
  Server.
- **Chrome's headless mode on Windows.**
  - It made the viewport 16 by 208 pixels smaller than the window, and it followed the system's dark mode.
  - The tests therefore print the real window size, and CI sets the colours explicitly with
    `--blink-settings=preferredColorScheme`.
  - I have not yet seen the workflow run on GitHub, because nothing has been pushed. The first push will show
    whether Linux behaves the same.
- **WCAG AAA cannot be proven by automated tests alone.** Some criteria need a person to judge: 3.1.3 unusual
  words, 3.1.5 reading level, 1.3.2 meaningful sequence, and how a screen reader actually announces things.
  `MAINTAINER.md` asks for a keyboard, zoom and screen reader check after bigger changes.
- **The game's own names are sometimes abbreviated, or in the accusative case.** This is handled by the
  abbreviation check in the updater and by `overrides`.

## 2026-10-19: an item is marked when everything under it is

### What changed

- **The rule.** An item is now marked must-have whenever everything under it is marked must-have. Before, marking
  Champion left Militia, Man-at-Arms, Long Swordsman and Two-Handed Swordsman unmarked, and showed Militia as only
  partly marked. Now marking Champion marks the whole line.
- **How it works.** `script.js` keeps two marks per item.
  - `chosen` is what the visitor set.
  - `self` is what counts: the visitor's own mark, or must-have when everything under the item counts as
    must-have.

  `settle()` works out `self` from `chosen`, from the bottom of the tree up, every time anything changes.
- **Undoing.** Because the parents' marks are worked out rather than stored, clearing Champion clears the marks it
  caused, instead of leaving four ticks behind.
- **Must-lack marks.** When marking an item makes the items above it must-have, any must-lack mark the visitor had
  put on those items is removed. It cannot hold any more, and it would otherwise come back if the item were
  cleared again.
- **Tests.** Seven new checks:
  - marking the last item of a line marks the whole line, and lists the right civilisations;
  - clearing it clears the line again;
  - it replaces must-lack marks above it;
  - marking every leaf under an item marks the item;
  - marking every item marks the whole tree;
  - and, after marking every third leaf and after marking every leaf, no item in the tree is left unmarked while
    everything under it is marked.

  With the old behaviour put back, six of them fail.
- **`MAINTAINER.md`.** Step 4 now explains that where an item sits in the tree matters, because of this rule.

### Question for you

- **Lumber Camp and Mining Camp.** In two places a civilisation has everything under an item without having the item
  itself:
  - Muisca and Tupi have all the Lumber Camp technologies.
  - Incas, Mapuche and Muisca have all the Mining Camp technologies.

  These civilisations research them at their Settlement instead. Under the new rule, marking all of those
  technologies also marks the camp, so these civilisations drop out of the list. Before, they stayed in. Every other
  item in the tree is unaffected: wherever a civilisation has everything under an item, it also has the item. Is
  that acceptable for the two camps? If not, the technologies could move out from under the camps in the tree.

## 2026-10-19: opening a branch opens its whole line

### What changed

- **Opening a branch opens the chain below it.** Opening a branch, with its arrow or the Right key, now also opens
  each only child below it, down to the end of the line or to the first item that has more than one child. So
  opening Militia shows everything down to Champion in one step. Before, it took four.
- **How it works.** `expand()` in `script.js` does this. Closing a branch, Expand all and Collapse all are
  unchanged. Find also still opens only the branches that lead to its matches.
- **Tests.** Two new checks:
  - For every branch in the tree, opening it from a fully closed tree leaves exactly that branch and its chain of
    only children open.
  - The Right key opens a line all the way down.

  With the old behaviour put back, both fail.
- **Note.** The current tree has no only child that itself forks into several children, so the "stop at the first
  fork" case is covered by the rule in the code and in the test, but no current item exercises it.

## 2026-10-19: optional items, an exception to the marking rule

### What changed

- **The exception.** Some items are now marked `"optional": true` in the tree in `data.json`: the Mill, Lumber Camp
  and Mining Camp. Civilisations with a Folwark, Mule Cart or Settlement have those buildings' technologies without
  having the building. An optional item is not marked automatically when everything under it is marked. It stays
  unmarked, and shows as partly marked.
- **What this allows.** An optional item can also be marked must-lack while everything under it is must-have. For
  example, "Two-Man Saw but no Lumber Camp" lists Muisca and Tupi. This answers the question about the two camps in
  the earlier entry.
- **Code.** `script.js` reads the flag when it builds the tree, and `settle()` skips optional items when it marks
  parents. The flag lives in `data.json`, not in the code (rule 1), so `script.js` still names no game item.
- **Tests.** Five new checks:
  - an optional item stays unmarked when everything under it is marked, and the right civilisations are listed;
  - an optional item can be must-lack while everything under it is must-have;
  - marking every leaf marks every item except optional ones (this replaces "marking every item marks the whole
    tree");
  - the flag only appears as `true`, on items with something under them;
  - a guard for future patches: any item that some civilisation can do without, while having everything under it,
    must be optional. Today that is the Lumber Camp and the Mining Camp. The Mill is optional by choice: Poles
    have its farming technologies without a Mill, though no civilisation has everything under it without one.

  When the code ignores the flag, three tests fail. When the flag is removed from Lumber Camp, the guard fails and
  names it.
- **`MAINTAINER.md`.** Step 4 explains optional items, and what to do if the guard fails after a game update.

## 2026-10-19: two numbers on closed items

### What changed

- **Closed items show two numbers.** An item that is closed and has something under it now shows two numbers, such
  as Militia's "52–39". The first counts the civilisations that have the item itself. The second counts those that
  have the item and everything under it, which is also what marking the item selects. For a line, the second number
  is its last upgrade's: 39 civilisations have Champion.
- **Open items, leaves and groups show one number.** An open item, and an item with nothing under it, show only
  their own number, so an open Militia line reads 52, 52, …, 39 down to Champion. Groups such as Economy have no
  item of their own, so they keep their single number: the civilisations with everything in the group.
- **Numbers follow the filters.** Both numbers count only civilisations that fit the marks so far, as before.
- **Code.** `count()` in `script.js` writes one item's number. `update()` calls it for every item, and `setOpen()`
  calls it whenever an item opens or closes.
- **Screen readers.** The visible "52–39" is hidden from them. They hear "52 civilisations, 39 civilisations with
  everything under it" instead.
- **Text.** Two new texts in every language: `range` (the visible "{own}–{all}", with an en dash) and `civRange`
  (the spoken version). I translated `civRange` myself, so please have it checked with the other texts.
- **Tests.** Six new checks:
  - closed items show both numbers;
  - a closed line shows its first item's and its last upgrade's numbers (the Militia example);
  - opening a line shows each item's own number;
  - open items show one number;
  - and both stay right with filters, open and closed.

  When every item always shows one number, three of them fail.

### Question for you

- **Items that branch.** For items that branch, I read "its deepest descendant" as "everything under it". So a
  closed Archery Range shows "56–0", because no civilisation has every Archery Range unit, unique units included.
  The other option would be the single deepest item under it, but where several items sit equally deep there is
  no single answer. Tell me if you would rather branching items showed only their own number when closed.

## 2026-10-19: a shorter tree by default, and an Options window

### What changed

- **Left out by default.**
  - The Unique Units, Unique Technologies and Unique Buildings groups. These are marked `"unique": true` in the
    tree in `data.json`.
  - Items that every civilisation has, when everything under them does too. The whole Town Center branch goes,
    along with Wonder, Monk, Murder Holes and others: 34 items in all.
  - Items that only one civilisation has, when everything under them does too: the Pasture, Domestication,
    Pastoralism and Transhumance.

  Universal and single-civilisation items are worked out from the data, from the bottom of the tree up, so an
  item goes once nothing under it is left. The tree drops from 469 items to 166. All five top-level rows stay.
- **Left out means left out entirely.** These items cannot be marked, do not count in the numbers, and do not stop a
  parent being marked. A closed Castle now shows 56–27 instead of 56–0, and the Monastery 54–7 instead of 54–1,
  because their unique units no longer count.
- **Options window.** An **Options** button now sits beside Clear, Expand all and Collapse all.
  - It opens a window with one checkbox, **Include Unique and Universal**, which is off by default. Ticking it shows
    the full tree again.
  - The choice is remembered in local storage. Marks and open branches survive switching it on and off, for items
    in both views.
  - The checkbox is a full-width row with the tree's own tick box, so the whole row is a 44 by 44 pixel target.
  - A line under it explains what it includes.
  - The window closes with Close or Escape, and focus returns to the Options button.
- **Code.** `prune()` and `plant()` in `script.js`:
  - `prune()` works out the shortened tree.
  - `plant()` rebuilds the tree when the option changes, keeping marks and open branches by each item's place in
    the tree.
- **The Monastery is now optional.** With unique units and the universal Monk left out, Armenians have every
  remaining Monastery technology but no Monastery, because they use the Fortified Church. The test for optional
  items now checks both the full tree and the shortened one, which is how it found this.
- **Counts no longer wrap.** A two-number count could break across lines at the dash next to a long name, such as
  "15–10" beside Mounted Crossbowman. It no longer does.
- **Text.** Four new texts in every language: `options`, `includeAll`, `includeHint` and `close`. The English
  wording of `includeAll` is yours. I translated the rest, so please have them checked.
- **Tests.**
  - New checks:
    - what the default view leaves out;
    - the Options button;
    - ticking and unticking with click and Space, keeping marks;
    - remembering the choice;
    - closing and returning focus;
    - accessibility with the window open, and with everything included and open;
    - the `unique` flag is only on groups.
  - The tests start from the default view and put the visitor's own choice back at the end.
  - Making the page show everything by default fails two checks. Removing the Monastery's flag fails the optional
    check.
- **`MAINTAINER.md`.** Step 4 explains the `unique` flag, the automatic leaving out, and the Monastery.

### Question for you

- **Items that still show 56–0.** Some items show 56–0 even without unique units: the Barracks, Archery Range,
  Stable (50–0), Siege Workshop and Dock. No civilisation has every regional unit under them, for example both the
  Elephant Archer and the Slinger. This is the
  same question as in the entry before: should branching items show only their own number when closed?

## 2026-10-19: script.js split into modules in js/ (rule 16)

### What changed

- **The layout.** `script.js`, which had grown to 1,401 lines, is now ten scripts in `js/`. They are native ES
  modules, linked with `import` and `export`, so there is still no build step and no dependency (rules 13 and 14).
  `index.html` loads `<script type="module" src="js/script.js">`.

  | Script | Lines | Its job |
  | --- | --- | --- |
  | `js/script.js` | 16 | Entry point: loads the data, starts the page, loads the tests (`?test`) or runs the updater (`?update`). |
  | `js/datahandler.js` | 238 | All data handling: loading `data.json` and the language files, the chosen language and its text and formats, availability sets, saved choices (`recall`, `remember`), and the updater's fetching and file writing. |
  | `js/model.js` | 113 | The tree and its rules: building and pruning it, marking, optional items, lines and chains, filter names. |
  | `js/ui.js` | 397 | All UI handling: the tree's DOM, counts, the civilisation list, filter buttons, Find, mouse, touch and keyboard, the language menu, the options window and the report window. |
  | `js/tests/run.js` | 93 | The test runner: the small-window frames, merging results, the report. |
  | `js/tests/helpers.js` | 87 | Shared test helpers and the sample items. |
  | `js/tests/audit.js` | 143 | The accessibility and layout audit. |
  | `js/tests/static.js` | 136 | Checks on the source files and the data. |
  | `js/tests/behaviour.js` | 218 | Marking, filters, counts, the tree, the keyboard, Find. |
  | `js/tests/interface.js` | 119 | The language menu, every language, the options window, text spacing. |
- **Why `model.js`.** Marking rules are neither data handling nor UI, and keeping them out of `ui.js` keeps it under
  400 lines. For the same reason the chosen language's text and formats (`nameOf`, `plural` and so on) now live in
  `datahandler.js`, and saved choices go through `recall` and `remember` there instead of `localStorage` in `ui.js`.
- **Tests only load when testing.** They are pulled in with a dynamic `import()` when the address has `?test`, so
  visitors no longer download them.
- **Modules from disk.** ES modules load from `file://` in Chrome with `--allow-file-access-from-files`, which CI
  already uses. I checked both static and dynamic imports before splitting. From a server, as with Live Server or
  GitHub Pages, nothing changes.
- **Tests now check the new layout.** They find every script by following the imports from `js/script.js`, so a new
  script is checked automatically, with no list to maintain. Rules now checked:
  - no comments in any script;
  - no CSS or HTML in the scripts;
  - every script is in `js/` and imports only scripts there;
  - test files are in `js/tests/` and load only when testing;
  - no script is over 400 lines (your guideline, made a check);
  - only `ui.js` (and the tests) touch the page, and only `datahandler.js` (and the tests) load or store data;
  - no game data in any script.

  Breaking each rule in a scratch copy fails exactly the matching check and names the file. This covers a comment,
  a 407-line `ui.js`, a static import of the tests, `document` in `model.js`, and `localStorage` in `ui.js`.
- **CI.** The list of allowed files in `.github/workflows/tests.yml` now accepts `js/…/name.js` instead of
  `script.js`.
- **Results.** All 108 tests pass in light and dark colours, in the main window and the 320 by 256, 360 by 640 and
  390 by 844 frames. The updater still reproduces `data.json`, reporting no changes apart from the date.
- **`MAINTAINER.md`** describes the scripts, what each one does, and what to do when one passes 400 lines.

### Note

- **The old `script.js`.** It is deleted from the working folder but not yet from git. Commit the deletion along
  with the new `js/` folder.

## 2026-10-19: at most 100 tests (rule 17)

### What changed

- **108 tests became 91.** I merged checks that test one feature into a single test with all of their conditions, so
  no behaviour lost coverage. A merged test's failure message just names the combined behaviour.
  - A click marks an item, then lists **and counts** the civilisations.
  - A long press marks must-lack, and a right-click clears it.
  - Marking a line's last item marks the line, and clearing it clears the line again.
  - The two "no item left unmarked" checks (some items marked, every item marked) are one.
  - "A whole line is named after its last upgrade" and "a line shows only its deepest must-have item" are one.
  - With filters, open and closed counts are one.
  - Expand all, Collapse all and a branch's arrow are one.
  - The keyboard checks are now two: Up, Down, Home and End; Right and Left.
  - Find marks matches and announces their number in one check.
  - Language menu: opening it with the current language marked is one check; Escape and leaving it is one;
    choosing a language and naming it on the button is one.
  - Options: opening and closing the window is one check; ticking the box and keeping marks is one.
  - On the page: no images, video or animations is one check.
  - Data: the `optional` and `unique` flags are one check.
- **One test removed outright.** "An open line shows only each item's own number" is gone. "Open items show only
  their own number" checks every open item, lines included.
- **A new guard.** "rules: there are at most 100 tests" counts the tests in the report, itself included. It runs in
  the main window, after the small-window results are merged in. That leaves room for nine more tests before one has
  to be folded in or replaced.
- **Checked.**
  - All 91 tests pass in light and dark colours, in the main window and the three small windows.
  - With the limit set to 90, the guard fails with "91 tests".
  - With counts always showing one number, three counts tests still fail.
  - With parents never marked automatically, six marking tests still fail.
- **`MAINTAINER.md`** explains the limit, what counts as a test, and what to do when it is reached. It also says to
  record changes in `DEVLOG.md`, which `RULES.md` now names for rule 8.

## 2026-10-19: a cogwheel button, with the language menu in the Options window

### What changed

- **First, the Options button moved into the header.** It went from beside Clear, Expand all and Collapse all to
  the header, next to the language button. At 400% zoom in Spanish (Mexico), the title was squeezed into a sliver
  and the header grew taller than the screen, so I let the header wrap. That was replaced straight away by the
  change below.
- **The Options button is now a cogwheel.** It shows ⚙ (U+2699) followed by U+FE0E, which asks for the plain-text
  form of the character rather than the coloured emoji. It is a text character in the page's text colour, not an
  image, so rule 9 holds, and the contrast tests measure it like any other text. It is hidden from screen readers,
  which hear the translated word "Options" from hidden text inside the button. The button is 44 by 44 pixels and
  sits at the top right.
- **The language menu now lives in the Options window.** It is labelled with a visible "Language". Its list now
  opens inside the window instead of being pinned to the top right of the screen; the window scrolls if the list
  does not fit. Escape first closes the list, then the window. Closing the window also closes the list.
- **The header** is back to the title and one button, with no wrapping needed.
- **Tests.** The language menu tests now open the Options window first, and check that the menu is inside it. To
  check that leaving the menu closes it, they now move focus to the checkbox, because the page behind an open
  window cannot take focus. The test count stays at 91. All 91 pass in light and dark colours, in all four window
  sizes.
- **`MAINTAINER.md`** says where the language menu is, and that the cogwheel opens the Options window.

## 2026-10-19: the Options window keeps its size

### What changed

- **The rule.** Opening or closing the language list no longer changes the size of the Options window.
- **How.**
  - The open window has a fixed height of `min(30rem, the screen's height minus 32px)`, set in `.options[open]`, and
    its usual width, so its size depends only on the screen, never on what is open inside it.
  - The window is a grid of four rows: the title, the language row, a shared area, and Close.
  - The language list and the settings (the checkbox and its explanation, now wrapped in `#settings`) share the
    third row and take turns: opening the list hides the settings, and closing it brings them back. `setMenu()` in
    `js/ui.js` does this.
  - The shared row takes whatever height is left, and the list scrolls inside it when it does not fit.
  - The language picker's wrapper uses `display: contents`, so its list can sit in the shared area while still
    counting as part of the picker for keyboard and click-outside handling.
- **The cost.** With the list closed, there is some empty space between the explanation and Close.
- **Tests.**
  - The language menu check now also records the window's size with the list closed, open and closed again, and
    requires all three to match. It is folded into an existing check, so there are still 91 tests.
  - To check that leaving the list closes it, the test now moves focus to Close, because the checkbox is hidden
    while the list is open.
  - All 91 tests pass in light and dark colours, in all four window sizes.
  - Without the fixed height, the check fails. The window measured 512 by 273, then 512 by 489, then 512 by 273.

## 2026-10-19: test bug fixed

### What changed

- Tests reduced from 91 to 90
  - Check for javascript in index.html was removed because a local live server injection was causing false positive.