1# Looking after AoE2 Civ Explorer

This guide is for whoever keeps the page up to date. You do not need to be a programmer for the usual job, which is
updating the page after Age of Empires II gets a patch. That takes a browser, a text editor and about ten minutes.

The guide starts with how the page is put together, because the update steps make more sense once you know that.
If you are in a hurry, jump to [After a game update](#after-a-game-update).

## How the page is put together

The page is four files and a folder of language files. There is nothing to install and nothing to build: the files you
see are exactly the files a visitor's browser downloads.

| File | What it holds |
| --- | --- |
| `index.html` | The structure of the page: the header, the two panes, the language menu. It holds no text of its own. |
| `style.css` | How the page looks: colours, sizes, the layout for big and small screens. |
| `script.js` | How the page behaves. It also holds two tools for you: the data updater and the tests. |
| `data.json` | Everything the page knows: the civilisations, the tree, which civilisation has what, and every piece of text in English, the default language. |
| `favicon.ico` | The small icon browsers show in the tab and in bookmarks. |
| `locales/` | One file per other language, such as `locales/de.json` for German, with every piece of text in that language. |

Three more files help you: this guide, `README.md`, and `.github/workflows/tests.yml`, which tells GitHub to run the
tests every time someone pushes a change.

The most important idea is that **all the facts live in `data.json` and the language files**. The other files never
mention a unit, a civilisation or a sentence. So a game update only ever changes `data.json` and the language files,
and you rarely need to open the other files at all.

A visitor's browser downloads `data.json` and the file of the language it shows, not all 17.

### Where the facts come from

The facts come from [aoe2techtree.net](https://aoe2techtree.net/), the community tech tree site. That site reads the
game's own files after every patch and publishes, for each civilisation, which buildings, units and technologies it
has, and the game's names for them in every language the game supports. This page offers the same 17 languages.

The page never contacts aoe2techtree.net while a visitor uses it. Instead, you copy the facts into `data.json` once
per patch, with the updater described below. That keeps the page fast and keeps it working even if that site is
down.

### What is in `data.json` and the language files

`data.json` is a text file in a format called JSON. You can open it in any text editor. Its main parts are:

- `source`: where the data comes from, and `updated`, the month it was last fetched. The footer of the page shows it.
- `languages`: the 17 languages. The first, English, is the default: its text is in `data.json` itself, and every
  other language has its own file in `locales`, named after its code. Each language has a `name` (as it is written
  in that language), a `tag` (the standard code that tells browsers and screen readers which language the text is
  in), and two settings the updater uses when it tidies the game's names: `spaces` (does the language put spaces
  between words?) and `mergeHyphens` (does a hyphen at the end of a line in the game's text split a single word, as
  in German?).
- `civs`: the civilisations, by their English names.
- `tree`: what the left pane shows, in order. **You edit this by hand.**
- `availability`: for each item in the tree, which civilisations have it. The updater writes this; never edit it.
- `ignore`: names from the game that you have decided not to show. **You edit this by hand.**
- `overrides`: corrections to English names from the game. **You edit this by hand.**
- `tools`: the English text of the updater and the tests.
- `text`: the English text, in four parts: `ui` (the page's own sentences), `groups` (the headings in the tree, such
  as Economy), and `civs` and `items` (the names of civilisations and items, which the updater writes).

Each file in `locales` holds the same two parts, `overrides` and `text`, for one other language. For example,
`locales/de.json` holds the corrections to German names and all the German text. Everything else is shared by all
languages, so it is only in `data.json`.

## Opening the page on your own computer

Browsers do not let a page read a file such as `data.json` straight from your disk, so you need a small local web
server. The simplest is Visual Studio Code with its Live Server extension: open the project folder, right-click
`index.html` and choose **Open with Live Server**. The page opens at an address like
`http://127.0.0.1:5501/index.html`. Any other way of serving a folder works too.

If the page is published, for example on GitHub Pages, you can also do everything below on the published address.

## After a game update

### Step 1: wait for aoe2techtree.net

Check the footer of [aoe2techtree.net](https://aoe2techtree.net/). It says which game update its data comes from.
Wait until that matches the new patch.

### Step 2: run the updater

Open the page with `?update` added to the address, for example `http://127.0.0.1:5501/index.html?update`.

A window called **Update the data files** opens. It fetches the newest data from aoe2techtree.net, which takes a few
seconds, and then lists what it found. It does not change anything yet.

### Step 3: read the report

Each line of the report is one finding. Most need nothing from you.

| The report says | What it means | What to do |
| --- | --- | --- |
| New civilisation: … | The patch added a civilisation. | Nothing. Its name in every language is added for you. |
| Civilisation no longer in the game: … | A civilisation disappeared. | Nothing. |
| Different civilisations now have: … | The patch changed who has this item. | Nothing. This is just so you know. |
| New name in … for …: … | The game renamed something in one language. | Nothing, unless the new name is wrong; see [Fixing a name](#fixing-a-name). |
| In the source data, but not yet in the tree: … | The patch added a building, unit or technology. | Put it in the tree (step 4), or add it to `ignore`. |
| In the tree, but not in the source data: … | Something in the tree was renamed or removed in the game. | Fix the tree (step 4). The updater stops until you do. |
| In the tree more than once: … | The same name is in the tree twice. | Remove one (step 4). The updater stops until you do. |
| No civilisation has: … | Probably removed from the game. | Consider removing it from the tree. |
| … has no text for: … | A language is missing one of the page's sentences or a group heading. | Add it; see [Changing the page's own text](#changing-the-pages-own-text). |
| Nothing has changed since the last update, apart from the date. | Exactly that. | Download anyway if you want the footer to show the new month. |

### Step 4: change the tree, if the report asked you to

Open `data.json` in your editor and find `"tree"`. It reads like an outline: each entry is one row of the left pane,
and `"kids"` lists what sits under it. Here is the start of the Stable, as an example:

```json
{"item": "Stable", "kids": [
  {"item": "Scout Cavalry", "kids": [
    {"item": "Light Cavalry", "kids": [
      {"item": "Hussar"}
    ]}
  ]},
  {"item": "Knight", "kids": [
```

- `"item"` is the item's English name, **exactly** as the report wrote it. The updater uses this name to look the
  item up, and fills in its names in all languages for you.
- `"kids"` is a list of the rows under this row. Leave it out when there are none.
- `"group"` instead of `"item"` makes a heading that is not a game item, such as Unique Units. The value is a short
  key, such as `"uniqueUnits"`. The heading's text in each language lives in `text`, under `groups`. If you invent a
  new group, add its text to every language's `groups`.

So to add a new unique unit to the Castle, find the Castle's Unique Units group and add a line such as
`{"item": "New Unit"},` in alphabetical order. Mind the commas: every entry in a list is followed by a comma, except
the last one. Visual Studio Code underlines mistakes in red.

When you have changed the tree, reload the `?update` page. The report should no longer mention those items.

### Step 5: download the new files

At the bottom of the report is one download link per file that changed: always **Download data.json**, and, for each
language whose text changed, a link such as **Download locales/de.json**. Save each file in place of the old one with
the same name: `data.json` in the project folder, and the language files in its `locales` folder.

### Step 6: run the tests

Open the page with `?test` added to the address, for example `http://127.0.0.1:5501/index.html?test`.

Wait about half a minute. You will see small copies of the page flash in the top-left corner: the tests also try the
page in a phone-sized window and in a 320 by 256 window, which is how the page looks to someone who zooms in to 400%.
At the end a window says **All … tests passed**, or lists what failed first. Each failure says what is wrong and
where, for example which text has too little contrast in which language.

### Step 7: publish

Commit the new files and push them, for example with GitHub Desktop or `git commit` and `git push`. GitHub runs
the same tests again, in Chrome, in light and dark colours and at several window sizes. You can watch them in the
**Actions** tab of the repository: a green tick means everything passed.

## Fixing a name

The names in all languages come from the game's own text. Usually they are right, but the game sometimes shortens a
name to fit its tech tree (such as "E." for "Elite") or uses a form that fits a sentence rather than a list. The
updater already copes with most of this, and `overrides` holds the corrections it cannot work out on its own.

To correct a name, add it to `overrides` in the language's file, with the item's English name on the left. For
example, in `locales/de.json`:

```json
"overrides": {
  "Heavy Mounted Crossbowman": "Schwerer berittener Armbrustschütze"
},
```

English corrections go in `overrides` in `data.json`. Then run the updater again (step 2) and download the new files
(step 5). An override wins over the game's name until you remove it.

## Changing the page's own text

The page's sentences, such as the button labels and the hints, are under `text`, then `ui`: in `data.json` for
English, and in the language's file in `locales` for the others. You can change them in any editor.

- Words in braces, such as `{n}`, `{name}`, `{parent}`, `{source}` and `{date}`, are filled in by the page. Keep them,
  though you may move them. The tests check that every language uses the same ones as English.
- A text with a count, such as `"compatible"`, has one form per kind of number: `"one"`, `"few"`, `"many"` and
  `"other"`. Languages differ in which they need. English needs "one" (1 civilisation) and "other" (2 civilisations);
  Polish and Russian also need "few" and "many". Every count needs `"other"`, which is used when no other form fits.
  The [Unicode plural rules](https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html)
  list which forms each language uses.
- The texts in `tools` are the updater's and the tests' messages. They are only in English.

## Adding a language

A new language works only if aoe2techtree.net has it, because the names come from there. Its code is the name of the
language's folder there, such as `de` for German.

1. Add the language to `languages` in `data.json` with its `name`, its `tag` (for example `pt-BR`), and `spaces` and
   `mergeHyphens` (copy these from a similar language).
2. Make the language's file in `locales`, named after its code, such as `locales/pt.json`. Start it as
   `{"overrides": {}, "text": {"ui": …, "groups": …}}`, with the English `ui` and `groups` copied from `text` in
   `data.json`, and translate them.
3. Run the updater, download, and run the tests. The updater fills in the names of every item and civilisation.

## Keeping to the project's rules

The project follows a few rules that keep it simple to look after. If you change the code, keep to them; the tests
check most of them.

- All facts and all text live in `data.json` and the language files in `locales`. All structure lives in
  `index.html`, all looks in `style.css`, all behaviour in `script.js`.
- No comments in the code. Explanations belong in this guide.
- No images, sounds or animations, apart from the tab icon `favicon.ico`, and no extra libraries, build steps or other
  programming languages.
- The page must meet WCAG 2.2 at level AAA, the strictest level of the web's accessibility guidelines. Among other
  things, that means text contrast of at least 7 to 1, every control at least 44 by 44 pixels, everything usable by
  keyboard alone, and a page that still works when zoomed to 400%.
- The page itself never scrolls. When it first opens, with every branch closed, it fits on the screen. When a screen
  is too small for that, the panes or the content area scroll instead.
- The tests must pass before a change is published.

Automated tests cannot prove everything about accessibility. After bigger changes, try the page with only a
keyboard, at 400% zoom, and with a screen reader, such as NVDA on Windows or VoiceOver on a Mac or iPhone.
