# Tests

This project originally had over 6000 tests which took multiple minutes to finish. The number of tests was later reduced to under a hundred. This project strives to have sensible testing. The goal is not to have 100% test coverage but to have tests which _sufficiently_ ensure the functional completeness, functional correctness, maintainability, and accessibility of aoe2civexplorer. For more guidelines on software quality and accessibility, see [ISO/IEC 25010:2011](https://cdn.standards.iteh.ai/samples/35733/2ca18b477b7845a5b8cae39d6de0c098/ISO-IEC-25010-2011.pdf), [ISO/IEC 25010:2023](https://cdn.standards.iteh.ai/samples/78176/13ff8ea97048443f99318920757df124/ISO-IEC-25010-2023.pdf) and [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

This document lists each test, its purpose, and in which test file it resides. This document is an effort to mitigate redundant tests and ensure test quality. It is intended as an aid in the trouble-shooting of potential false positives.

Test descriptions must remain brief and parameters (eg. Purpose) may not exceed 120 characters. Tests are ordered in order of their execution.

The test report and the GitHub check name each test by its number here, such as "Test 15 failed". The number is worked out
while the tests run: it is the test's place in the order the tests first run in the main window. So when a test is added,
removed or moved, renumber this document to match.

WCAG 2.2 AAA is only required with Simple UI on, so the tests run with Simple UI on. Tests 45 to 49 turn it off to test the pictures.

## Table of contents per category

Functional completeness & correctness tests:

- [Test 1](#test-1): Each language has all of the page's text
- [Test 2](#test-2): Each language names every item and civ
- [Test 3](#test-3): A click marks must have and lists the civs
- [Test 4](#test-4): A marked item gets a filter button
- [Test 5](#test-5): X marks must lack
- [Test 6](#test-6): The menu key and right-click mark must lack
- [Test 7](#test-7): Space clears a mark
- [Test 8](#test-8): Marking a building marks and shows all in it
- [Test 9](#test-9): A fully marked branch reads "Full" in Filters
- [Test 10](#test-10): A partly marked branch shows a white dash, must have a green tick and must lack a red cross
- [Test 11](#test-11): A line's filter is named after its deepest mark
- [Test 12](#test-12): A line's filter button clears only its own kind of mark
- [Test 13](#test-13): A fully marked building reads Full, also heading a line, but not with nothing under it nor in Fortifications
- [Test 14](#test-14): Marking a top-level group marks and shows all in it
- [Test 15](#test-15): Everything open and a long civ list fit the screen, on phones too, panes sharing the height
- [Test 16](#test-16): A long press marks must lack, and a right-click clears it
- [Test 17](#test-17): Marking the top of a line passes the mark down only at the same count
- [Test 18](#test-18): Marking a line's end marks only that item
- [Test 19](#test-19): A mark never passes up
- [Test 20](#test-20): An item can be must lack while everything under it is must have
- [Test 21](#test-21): Marking a unit or technology opens its line
- [Test 22](#test-22): Below the top of a line, a mark passes down only at the same count
- [Test 23](#test-23): A closed item shows its own and its full count
- [Test 24](#test-24): A closed line shows its first and last counts
- [Test 25](#test-25): An open item shows only its own count
- [Test 26](#test-26): Counts follow the filters
- [Test 27](#test-27): Expand all, Collapse all and the arrows work
- [Test 28](#test-28): Opening a branch opens its only children
- [Test 29](#test-29): Find highlights in yellow, opens to and counts matches
- [Test 30](#test-30): Find reports no match, and clears when emptied
- [Test 31](#test-31): The language menu is in Options, with every language
- [Test 32](#test-32): The language menu closes on Escape, a click or leaving it, and Options keeps its size
- [Test 33](#test-33): Choosing a language changes the page
- [Test 34](#test-34): English is the default, and the language is kept in the address
- [Test 35](#test-35): Marks survive a language change
- [Test 36](#test-36): The page's text is in the chosen language
- [Test 37](#test-37): The tree is in the chosen language
- [Test 38](#test-38): No placeholders are left in the text
- [Test 39](#test-39): The footer links the source and Microsoft's rules, as wide as the page, hidden on phones
- [Test 40](#test-40): The civ list is translated and sorted
- [Test 41](#test-41): Unique and universal items are hidden by default, regional ones shown
- [Test 42](#test-42): Ticking Include shows every item, unticking Include Regionals hides regional ones, keeping marks
- [Test 43](#test-43): The Include and Include Regionals choices are remembered
- [Test 44](#test-44): Options opens with Include unticked and Include Regionals ticked, and Close returns focus
- [Test 45](#test-45): The pictures, cursors and tab icon suit the screen, the page sits on the parchment, the footer spans it or is hidden on phones
- [Test 46](#test-46): Every checkbox and radio button shows its picture from its sheet, and tree rows their outlined icons
- [Test 47](#test-47): The Find box shows a search icon or a clearing cross; the tree and Include have tooltips unless turned off
- [Test 48](#test-48): Without Simple UI, the tree has Clear and Expand all, which is Collapse all while a branch is open
- [Test 49](#test-49): Simple UI takes away every image and the civ links and unticking brings them back, its box staying put

Accessibility tests:

- [Test 50](#test-50): Each language has a name and a valid tag
- [Test 51](#test-51): A filter button clears its item and focus moves on
- [Test 52](#test-52): Clearing the last filter moves focus and shows the hint
- [Test 53](#test-53): Right opens a line all the way down
- [Test 54](#test-54): Right and Left go into and out of branches
- [Test 55](#test-55): Up, Down, Home and End move through the tree
- [Test 56](#test-56): Down on an arrow goes to the next arrow
- [Test 57](#test-57): Enter goes to the first match
- [Test 58](#test-58): The page has a title and a language
- [Test 59](#test-59): Language tags are valid and choices are marked
- [Test 60](#test-60): One header, main, footer and main heading
- [Test 61](#test-61): Headings have text and skip no levels
- [Test 62](#test-62): Ids are unique and ARIA references resolve
- [Test 63](#test-63): Controls say what state they are in
- [Test 64](#test-64): Control names contain their visible text
- [Test 65](#test-65): Text contrast is at least 7:1, or 4.5:1 when large
- [Test 66](#test-66): Control borders have a contrast of at least 3:1
- [Test 67](#test-67): Targets are at least 44 by 44 pixels
- [Test 68](#test-68): The page does not scroll
- [Test 69](#test-69): Nothing sticks out sideways
- [Test 70](#test-70): Text is not justified and has 1.5 line spacing
- [Test 71](#test-71): No images, sounds, video or animations on the page
- [Test 72](#test-72): Down and End move through the language menu
- [Test 73](#test-73): Focus shows a thick, high-contrast outline
- [Test 74](#test-74): Nothing covers what has focus
- [Test 75](#test-75): Wider text spacing breaks nothing
- [Test 76](#test-76): Space unticks and ticks Include and Include Regionals, keeping marks

Maintainability tests:

- [Test 77](#test-77): No comments in the code
- [Test 78](#test-78): No CSS or HTML in the scripts, only numbers for CSS custom properties
- [Test 79](#test-79): script.js in the main folder, other scripts in js/, tests on demand
- [Test 80](#test-80): No file over 400 lines of code, no function over 60, no line over 120 characters
- [Test 81](#test-81): Page code stays out of script.js, datahandler.js and model.js, and data code is in datahandler.js
- [Test 82](#test-82): Images and fonts only from assets/ and without Simple UI, a blank tab icon; no sounds, animations or dependencies
- [Test 83](#test-83): No game data in the scripts
- [Test 84](#test-84): Each item is in the tree once
- [Test 85](#test-85): The tree uses only known fields, and unique and lines flags are well placed
- [Test 86](#test-86): Each item's availability names known civs, and each item has an icon
- [Test 87](#test-87): Counted texts have an "other" form
- [Test 88](#test-88): Translations keep their placeholders
- [Test 89](#test-89): Overrides name known items and civs
- [Test 90](#test-90): Source, tool texts and ignore list are filled in
- [Test 91](#test-91): The updater writes and reads back every value
- [Test 92](#test-92): Availability is stored in its shortest form
- [Test 93](#test-93): Stored names are already tidy
- [Test 94](#test-94): There are at most 100 tests

## Test 1

### File residence:
`js/tests/static.js`, lines 228-229

### Purpose:
Prevent missing interface text in any language.

### Assertion expectation:
Every language has every interface text English has, and a name for every group.

## Test 2

### File residence:
`js/tests/static.js`, lines 230-233

### Purpose:
Prevent untranslated items and civilisations in the tree and the civ list.

### Assertion expectation:
Every language has a name for every item and every civilisation.

## Test 3

### File residence:
`js/tests/behaviour.js`, lines 28-30

### Purpose:
Verify that a left-click marks must have and the civ list and count follow (Req. 3, 4).

### Assertion expectation:
Item is "has" and aria-checked is true; list holds its civs in order; count reads "n compatible civilisations".

## Test 4

### File residence:
`js/tests/behaviour.js`, lines 32-33

### Purpose:
Verify that the Filters list appears when an item is marked (Req. 22, 23).

### Assertion expectation:
Exactly one filter button exists, labelled with the item's name and its must-have mark.

## Test 5

### File residence:
`js/tests/behaviour.js`, lines 35-36

### Purpose:
Verify that X marks must lack (Req. 3).

### Assertion expectation:
Item is "lacks", reads ", must lack", and the civs that have it leave the list.

## Test 6

### File residence:
`js/tests/behaviour.js`, line 39

### Purpose:
Verify that the menu key and right-click mark must lack (Req. 3).

### Assertion expectation:
After a contextmenu event the item is "lacks" and the browser's own menu is suppressed.

## Test 7

### File residence:
`js/tests/behaviour.js`, line 41

### Purpose:
Verify that Space clears a mark from the keyboard (Req. 3, WCAG 2.1.1).

### Assertion expectation:
Space on a must-have item leaves it unmarked.

## Test 8

### File residence:
`js/tests/behaviour.js`, lines 50-51

### Purpose:
Verify Req. 24 and 31: marking a building marks everything in it, and opens the way to all of it.

### Assertion expectation:
From closed, clicking a building makes it "has", and every item below it "has" and shown.

## Test 9

### File residence:
`js/tests/behaviour.js`, line 52

### Purpose:
Verify Req. 24: a fully marked branch is listed as "Full <name>" in Filters.

### Assertion expectation:
Exactly one filter button exists, named "Full" plus the branch's name.

## Test 10

### File residence:
`js/tests/behaviour.js`, lines 54-58

### Purpose:
Verify Req. 14, 23 and 26: a mixed box shows a white dash, a must-have box a green tick, a must-lack box a red cross.

### Assertion expectation:
A branch with its first child cleared is "mixed", with a white dash; the legend's tick is green and its cross red.

## Test 11

### File residence:
`js/tests/behaviour.js`, lines 63-64

### Purpose:
Verify Req. 25: a marked line's filter entry is titled after its deepest must-have item.

### Assertion expectation:
Marking a line's top names its filter after its deepest must-have item; marking the line's end renames it so.

## Test 12

### File residence:
`js/tests/behaviour.js`, lines 67-68

### Purpose:
Ensure a filter button never clears marks it does not show.

### Assertion expectation:
With the line's last item must lack, the must-have filter button clears all others; the last item stays "lacks".

## Test 13

### File residence:
`js/tests/behaviour.js`, lines 69-82

### Purpose:
Verify Req. 24, 25 and 30: "Full <name>" only with something under it; Fortifications' lines act as units.

### Assertion expectation:
"Full <name>" heading a line; just the name with nothing under it; a wall or tower line is named after its end.

## Test 14

### File residence:
`js/tests/behaviour.js`, lines 88-89

### Purpose:
Verify that a top-level group passes its mark to everything in it, and shows it all (Req. 31).

### Assertion expectation:
From closed, clicking the group makes its state "has", while it holds no mark itself, and shows every item in it.

## Test 15

### File residence:
`js/tests/behaviour.js`, lines 92-125

### Purpose:
Verify that on phones a full tree and civ list never stretch the page or crush the tree pane, as they once did.

### Assertion expectation:
No page scroll; headers inside panes; no overlap; list scrolls in place; stacked scroll areas within 1px of each other.

## Test 16

### File residence:
`js/tests/behaviour.js`, lines 160-161

### Purpose:
Verify marking by long press and right-click (Req. 3).

### Assertion expectation:
A 600 ms touch press marks the item "lacks"; a right-click on it then clears it.

## Test 17

### File residence:
`js/tests/behaviour.js`, lines 166-181

### Purpose:
Verify Req. 29 and 30 at the top of a line, which Req. 27 no longer exempts: a mark passes down only at equal counts.

### Assertion expectation:
A click on a line's top marks it and its equal counts "has", X "lacks", with the right lists; again clears them.

## Test 18

### File residence:
`js/tests/behaviour.js`, lines 182-184

### Purpose:
Verify Req. 30: a mark on a line's last item passes to no other item.

### Assertion expectation:
After a click on a line's end, it alone is "has"; the items above stay unmarked; the list fits the end alone.

## Test 19

### File residence:
`js/tests/behaviour.js`, lines 189-193

### Purpose:
Verify Req. 30: marking everything at the ends of a building marks nothing above them.

### Assertion expectation:
After clicks on every leaf in a building, only the leaves are "has"; the building is unmarked and shows a dash.

## Test 20

### File residence:
`js/tests/behaviour.js`, lines 195-198

### Purpose:
Allow searching for civs that get a building's contents elsewhere, such as Two-Man Saw without a Lumber Camp.

### Assertion expectation:
With a building must lack and everything under it must have, the list is not empty and is correct.

## Test 21

### File residence:
`js/tests/behaviour.js`, lines 204-208

### Purpose:
Verify Req. 28 and 31: marking a unit or technology opens it, showing every item marked with it.

### Assertion expectation:
Clicking a closed line item opens it down to the end of its line, so every item below it is shown.

## Test 22

### File residence:
`js/tests/behaviour.js`, lines 210-219

### Purpose:
Verify Req. 29 and 30: below a line's top, a mark passes down only to items held by as many civilisations.

### Assertion expectation:
A click marks only the items below with equal counts; X skips other counts; nothing above is marked.

## Test 23

### File residence:
`js/tests/behaviour.js`, line 244

### Purpose:
Verify each item's compatible civilisations count (Req. 3).

### Assertion expectation:
Closed items with contents show "own–all" counts and other items their own count, on screen and to screen readers.

## Test 24

### File residence:
`js/tests/behaviour.js`, lines 245-246

### Purpose:
Verify that a closed upgrade line shows the range from its first item to its last upgrade.

### Assertion expectation:
The line's count reads its first item's civ count, then its last item's civ count.

## Test 25

### File residence:
`js/tests/behaviour.js`, line 248

### Purpose:
Avoid a misleading range once an item's contents are visible.

### Assertion expectation:
After Expand all, every item shows only its own count.

## Test 26

### File residence:
`js/tests/behaviour.js`, lines 253-254

### Purpose:
Verify that the counts follow the active filters (Req. 3).

### Assertion expectation:
With a must-have and a must-lack mark, open and closed items count only the civs that fit the filters.

## Test 27

### File residence:
`js/tests/behaviour.js`, lines 267-268

### Purpose:
Verify Req. 18 and 19, and each branch's arrow.

### Assertion expectation:
Expand all opens every branch, Collapse all closes every branch, and a branch's arrow opens and closes it.

## Test 28

### File residence:
`js/tests/behaviour.js`, lines 269-274

### Purpose:
Save clicks by opening a line of only children in one step.

### Assertion expectation:
For every branch, its arrow opens exactly the chain of only children below it, and nothing else.

## Test 29

### File residence:
`js/tests/behaviour.js`, lines 313-317

### Purpose:
Verify Req. 20 and 21: the search highlights its matches in yellow, opens to them and counts them.

### Assertion expectation:
Exactly the matches are highlighted in yellow and shown; the number shows on one line right of the search bar.

## Test 30

### File residence:
`js/tests/behaviour.js`, lines 321-322

### Purpose:
Verify the search's feedback for no matches and for an empty search (Req. 21).

### Assertion expectation:
A search without matches says none found, on one line right of the search bar; emptying it empties the label.

## Test 31

### File residence:
`js/tests/interface.js`, lines 36-41

### Purpose:
Verify Req. 8 and 9: the Language menu is in the Options window and offers every language.

### Assertion expectation:
Options opens with focus on the menu, which opens to one option per language, each in its own language, current marked.

## Test 32

### File residence:
`js/tests/interface.js`, lines 50-52

### Purpose:
Verify Req. 12 and Rule 18: the language menu closes cleanly and nothing moves.

### Assertion expectation:
Escape closes it and refocuses its button; a click in it or leaving it closes it; the Options window never resizes.

## Test 33

### File residence:
`js/tests/interface.js`, lines 56-59

### Purpose:
Verify Req. 11: the page changes to the chosen language.

### Assertion expectation:
The page's lang and title change to the chosen language; the menu closes, refocuses its button and names the language.

## Test 34

### File residence:
`js/tests/interface.js`, lines 13-21 and 60-61

### Purpose:
Verify Req. 10, and keep the chosen language when the link is shared or the page reloaded.

### Assertion expectation:
Without a choice the page picks English, even for a German browser; the address holds lng=<choice>, but not as a file.

## Test 35

### File residence:
`js/tests/interface.js`, lines 62-63

### Purpose:
Ensure changing the language never loses the user's marks.

### Assertion expectation:
After a language change the marked item is still "has" and the civ list is unchanged.

## Test 36

### File residence:
`js/tests/interface.js`, lines 76-77

### Purpose:
Verify Req. 11 for all interface text, in every language.

### Assertion expectation:
Every element with data-text shows the chosen language's text for its key.

## Test 37

### File residence:
`js/tests/interface.js`, lines 78-79

### Purpose:
Verify Req. 11 for the tree, in every language.

### Assertion expectation:
Every tree label shows the chosen language's item or group name.

## Test 38

### File residence:
`js/tests/interface.js`, lines 80-81

### Purpose:
Catch unfilled {placeholders} shown to users.

### Assertion expectation:
No visible text on the page contains { or }.

## Test 39

### File residence:
`js/tests/interface.js`, lines 83-88

### Purpose:
Verify Req. 5: the footer credits the data source, and gives Microsoft's notice in English.

### Assertion expectation:
Links to source and rules from data.json; notice marked English; footer spans the panes, or is hidden on a phone.

## Test 40

### File residence:
`js/tests/interface.js`, lines 91-92

### Purpose:
Verify that the civ list is translated and sorted alphabetically in every language (Req. 4).

### Assertion expectation:
With a must-have and a must-lack mark, the list holds the right civs' names, sorted in the chosen language.

## Test 41

### File residence:
`js/tests/interface.js`, lines 101-104

### Purpose:
Verify Req. 13 and 15: by default the tree leaves out unique and universal items, and shows regional ones.

### Assertion expectation:
No item from a unique group is shown, some regional one is, and every shown leaf is held by more than one civ, not all.

## Test 42

### File residence:
`js/tests/interface.js`, lines 121-124

### Purpose:
Verify Req. 14 and 15, and Include Regionals: each box adds or removes its items and keeps marks.

### Assertion expectation:
Include: every item shown. Unticked Regionals: no regional item or item under one. Mark and civ list unchanged.

## Test 43

### File residence:
`js/tests/interface.js`, line 125

### Purpose:
Keep the Include Unique and Universal and the Include Regionals choices for the next visit.

### Assertion expectation:
Browser storage holds include=true and regional=false after the clicks. Passes when the browser offers no storage.

## Test 44

### File residence:
`js/tests/interface.js`, lines 127-128

### Purpose:
Verify Req. 7, 13 and 16, and that focus returns when the Options window closes (WCAG 2.4.3).

### Assertion expectation:
Options opens with Include unticked and Include Regionals ticked; Close closes it and returns focus to the button.

## Test 45

### File residence:
`js/tests/pictures.js`, lines 20-66

### Purpose:
Verify that without Simple UI the pictures and cursors suit the screen and everything sits on the parchment.

### Assertion expectation:
Right background; sword, pointing on links; Options (sd/4k, ring); tab icon; on the parchment; footer full, or hidden.

## Test 46

### File residence:
`js/tests/pictures.js`, lines 68-103 and 243-245

### Purpose:
Verify that without Simple UI boxes show their sheets, and tree rows their icons, outlined as colour_key.csv says.

### Assertion expectation:
Boxes and radios: row by state, no drawn marks but a black dash. Icons: right file, loaded, 44px, CSV outline.

## Test 47

### File residence:
`js/tests/pictures.js`, lines 105-152 and 247-249

### Purpose:
Verify that without Simple UI Find clears with its cross, and tooltips show over the tree and Include unless turned off.

### Assertion expectation:
325px field, no ring, status beside it; clearing cross; tip at the cursor; Include's hint as a tip; none if off.

## Test 48

### File residence:
`js/tests/pictures.js`, lines 154-205 and 251-254

### Purpose:
Verify that without Simple UI Expand all turns into Collapse all in place while a branch is open, and hands focus on.

### Assertion expectation:
Clear and Expand all, or Collapse all with a top branch open; side by side, pane-wide; whole sprite; text fits.

## Test 49

### File residence:
`js/tests/pictures.js`, lines 207-231 and 256-257

### Purpose:
Verify Req. 2, 32 and 33, and Rules 18 and 22: Simple UI turns every image and civ link off and on; its box stays put.

### Assertion expectation:
Ticking: no image, tab icon or civ link, full title, box still, saved. Unticking: same pictures and links, box still.

## Test 50

### File residence:
`js/tests/static.js`, lines 237-238

### Purpose:
Keep the language menu and the page's lang attributes correct (WCAG 3.1.1, 3.1.2).

### Assertion expectation:
Every language has a name and a well-formed language tag.

## Test 51

### File residence:
`js/tests/behaviour.js`, lines 135-137

### Purpose:
Verify that filter buttons remove filters without losing keyboard focus (WCAG 2.4.3).

### Assertion expectation:
Clicking the first filter button clears its item and moves focus to the next filter button.

## Test 52

### File residence:
`js/tests/behaviour.js`, lines 139-141

### Purpose:
Keep focus and guidance sensible once no filters remain (WCAG 2.4.3).

### Assertion expectation:
Focus is on the Civilisations heading, the list is empty, the start hint shows and the Filters list is hidden.

## Test 53

### File residence:
`js/tests/behaviour.js`, lines 281-282

### Purpose:
Give keyboard users the same one-step opening of a line (WCAG 2.1.1).

### Assertion expectation:
Right on a line's first item opens exactly that line's chain of only children.

## Test 54

### File residence:
`js/tests/behaviour.js`, lines 296-297

### Purpose:
Verify keyboard navigation into and out of branches (WCAG 2.1.1).

### Assertion expectation:
Right opens a branch, Right again focuses its first child, Left returns to the branch, Left again closes it.

## Test 55

### File residence:
`js/tests/behaviour.js`, lines 301-302

### Purpose:
Verify keyboard movement through the tree (WCAG 2.1.1).

### Assertion expectation:
Up on the first item stays put, Down moves to the next, End focuses the last top item and Home the first.

## Test 56

### File residence:
`js/tests/behaviour.js`, line 305

### Purpose:
Let keyboard users move between branch arrows directly.

### Assertion expectation:
Down on the first branch's arrow focuses the second branch's arrow.

## Test 57

### File residence:
`js/tests/behaviour.js`, lines 330-331

### Purpose:
Let keyboard users jump from the search bar to the results (WCAG 2.1.1).

### Assertion expectation:
Enter in the search bar focuses the first match.

## Test 58

### File residence:
`js/tests/audit.js`, lines 84-85

### Purpose:
WCAG 2.4.2 and 3.1.1: the page has a title and states its language.

### Assertion expectation:
The page title is not empty and the page's lang is the current language's tag.

## Test 59

### File residence:
`js/tests/audit.js`, lines 86-89

### Purpose:
WCAG 3.1.2: screen readers pronounce each language's name in that language.

### Assertion expectation:
Every lang attribute is well formed, and each language option's lang is that language's tag.

## Test 60

### File residence:
`js/tests/audit.js`, lines 91-93

### Purpose:
WCAG 1.3.1: landmarks and a main heading let assistive technology find its way around the page.

### Assertion expectation:
There is exactly one header, one main, one footer and one visible h1.

## Test 61

### File residence:
`js/tests/audit.js`, lines 94-95

### Purpose:
WCAG 1.3.1 and 2.4.10: the headings form a clear outline.

### Assertion expectation:
Every visible heading has text and is at most one level below the heading before it.

## Test 62

### File residence:
`js/tests/audit.js`, lines 102-105

### Purpose:
WCAG 4.1.2: labels and relationships resolve for assistive technology.

### Assertion expectation:
No id repeats, and every id in aria-labelledby, aria-controls and aria-describedby exists.

## Test 63

### File residence:
`js/tests/audit.js`, lines 111-116

### Purpose:
WCAG 4.1.2: assistive technology can read each control's state.

### Assertion expectation:
Checkboxes have aria-checked true, false or mixed; arrows and the menu button have aria-expanded matching the screen.

## Test 64

### File residence:
`js/tests/audit.js`, lines 118-122

### Purpose:
WCAG 2.5.3 and 4.1.2: every control has a name matching what users see.

### Assertion expectation:
Every control has an accessible name, and, except for text inputs, that name contains its visible text.

## Test 65

### File residence:
`js/tests/audit.js`, lines 128-134

### Purpose:
WCAG 1.4.6 (AAA): text has enhanced contrast.

### Assertion expectation:
All visible text has a contrast of at least 7:1 with its background, or 4.5:1 for large text.

## Test 66

### File residence:
`js/tests/audit.js`, lines 135-140

### Purpose:
WCAG 1.4.11: the edges of controls are visible.

### Assertion expectation:
Buttons, filter buttons, inputs and checkboxes with a border have a border contrast of at least 3:1.

## Test 67

### File residence:
`js/tests/audit.js`, lines 146-149

### Purpose:
WCAG 2.5.5 (AAA): targets are large enough to hit.

### Assertion expectation:
Every focusable control, except links inside running text, is at least 44 by 44 CSS pixels.

## Test 68

### File residence:
`js/tests/audit.js`, lines 150-151

### Purpose:
Enforce Rule 12: no page scrolling.

### Assertion expectation:
The page is no taller and no wider than the window.

## Test 69

### File residence:
`js/tests/audit.js`, lines 152-155

### Purpose:
WCAG 1.4.10: content reflows without scrolling sideways.

### Assertion expectation:
No visible element extends past the left or right edge of the window.

## Test 70

### File residence:
`js/tests/audit.js`, lines 156-161

### Purpose:
WCAG 1.4.8 (AAA): text is presented readably.

### Assertion expectation:
No paragraph or list item is justified, and each has a line height of at least 1.5 times its font size.

## Test 71

### File residence:
`js/tests/audit.js`, lines 164-173

### Purpose:
Enforce Rules 9, 10, 11 and 22 on the page as rendered, with Simple UI on.

### Assertion expectation:
No media elements or tab icon, no images in CSS, the page's own background included, no animations or transitions.

## Test 72

### File residence:
`js/tests/interface.js`, lines 154-155

### Purpose:
Verify keyboard use of the language menu (WCAG 2.1.1).

### Assertion expectation:
Down on the menu button opens the menu at the current language; Down moves one on; End reaches the last language.

## Test 73

### File residence:
`js/tests/audit.js`, lines 62-71 and 79

### Purpose:
WCAG 2.4.7 and 2.4.13 (AAA): keyboard focus is clearly visible.

### Assertion expectation:
Every focusable element takes focus and shows an outline at least 2 px wide with a contrast of at least 3:1.

## Test 74

### File residence:
`js/tests/audit.js`, lines 44-57, 72-76 and 80

### Purpose:
WCAG 2.4.12 (AAA): nothing hides the element that has focus.

### Assertion expectation:
The centre of the visible part of each focused element's first line is that element, not something covering it.

## Test 75

### File residence:
`js/tests/interface.js`, lines 177-180

### Purpose:
WCAG 1.4.12: wider text spacing set by the user does not break the layout.

### Assertion expectation:
With WCAG's text spacing applied, the page and every element stay within the window's width.

## Test 76

### File residence:
`js/tests/interface.js`, lines 199-202

### Purpose:
Verify that the Include Unique and Universal and Include Regionals boxes work from the keyboard (WCAG 2.1.1).

### Assertion expectation:
Space unticks either box and its items leave the tree; Space ticks Regionals again; marks and civ list unchanged.

## Test 77

### File residence:
`js/tests/static.js`, lines 191-195

### Purpose:
Enforce Rule 7: no comments in the code.

### Assertion expectation:
index.html, style.css and every script hold no comment markers. The comment live-server injects is ignored.

## Test 78

### File residence:
`js/tests/static.js`, lines 196-197

### Purpose:
Enforce Rule 2: no CSS or HTML inside the JavaScript.

### Assertion expectation:
No inline styles but setProperty("--name", number); no HTML strings, createElement or document.write.

## Test 79

### File residence:
`js/tests/static.js`, lines 198-204

### Purpose:
Enforce Rules 2 and 16, and keep the tests out of what visitors download.

### Assertion expectation:
script.js is in the main folder and every other script in js/; imports point into js/; only js/tests/ loads on demand.

## Test 80

### File residence:
`js/tests/static.js`, lines 41-160 and 205-206

### Purpose:
Verify Rules 23, 24 and 25: functions, lines and files stay small enough to read. GitHub checks Rule 26.

### Assertion expectation:
index.html, style.css and every script: at most 400 lines of code, functions at most 60, lines at most 120 characters.

## Test 81

### File residence:
`js/tests/static.js`, lines 207-213

### Purpose:
Keep page code out of script.js, datahandler.js and model.js, and data loading and storage in datahandler.js.

### Assertion expectation:
script.js, datahandler.js and model.js never touch the page; only datahandler.js uses fetch or localStorage.

## Test 82

### File residence:
`js/tests/static.js`, lines 168-180 and 214-221

### Purpose:
Enforce Rules 9, 10, 11, 14 and 22 in the source files.

### Assertion expectation:
img only in templates; blank tab icon; url() to assets/images/ in .pictures rules, assets/fonts/ in @font-face; etc.

## Test 83

### File residence:
`js/tests/static.js`, lines 222-223

### Purpose:
Enforce Rule 1: game data lives only in data.json.

### Assertion expectation:
No civilisation or item name from data.json appears as a quoted string in any script.

## Test 84

### File residence:
`js/tests/static.js`, line 244

### Purpose:
Prevent duplicate items in the tree, which would break counts and marking.

### Assertion expectation:
Every item appears exactly once in the tree in data.json.

## Test 85

### File residence:
`js/tests/static.js`, lines 251-253

### Purpose:
Catch misspelt, stale or misplaced fields in the tree in data.json, such as the retired "optional" flag.

### Assertion expectation:
Tree entries use only item, group, kids, unique and lines; "unique" and "lines" are true and only on groups.

## Test 86

### File residence:
`js/tests/static.js`, lines 254-260

### Purpose:
Ensure every item's availability is defined and names real civilisations, and every item has an icon.

### Assertion expectation:
Availability is "all" or a has or lacks list of known civilisations; pictures gives a kind, picture number and reach.

## Test 87

### File residence:
`js/tests/static.js`, lines 268-269

### Purpose:
Ensure counted texts have a fallback form for any number.

### Assertion expectation:
Every counted (plural) text in every language has an "other" form.

## Test 88

### File residence:
`js/tests/static.js`, lines 270-272

### Purpose:
Prevent translations that lose or misspell placeholders such as {n}.

### Assertion expectation:
Each interface text has the same {placeholders} in every language as in English.

## Test 89

### File residence:
`js/tests/static.js`, lines 273-275

### Purpose:
Catch stale or misspelt name corrections after a game update.

### Assertion expectation:
Every key in each language's overrides is a known item or civilisation.

## Test 90

### File residence:
`js/tests/static.js`, lines 276-281

### Purpose:
Ensure the footer, the updater and the tests have the data they need (Req. 5).

### Assertion expectation:
source has name, url, data, an integer helpOffset and a YYYY-MM date; no tool text is empty; ignore is a list of text.

## Test 91

### File residence:
`js/tests/static.js`, lines 295-297

### Purpose:
Ensure the updater writes data.json and the locale files without losing or changing data.

### Assertion expectation:
Writer outputs data.json plus one locales/ file per other language; reading them back gives identical data.

## Test 92

### File residence:
`js/tests/static.js`, lines 301-302

### Purpose:
Keep data.json compact and identical to what the updater would write.

### Assertion expectation:
Each item's availability is "all", or whichever of the has or lacks lists is shorter.

## Test 93

### File residence:
`js/tests/static.js`, lines 303-305

### Purpose:
Keep stored names identical to what the updater would write.

### Assertion expectation:
Joining lines and tidying spaces leaves every stored item and civilisation name unchanged, in every language.

## Test 94

### File residence:
`js/tests/run.js`, lines 88-89

### Purpose:
Enforce Rule 17: at most 100 tests.

### Assertion expectation:
The number of tests in the report, this one included, is at most 100.
