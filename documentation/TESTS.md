# Tests

This project originally had over 6000 tests which took multiple minutes to finish. The number of tests was later reduced to under a hundred. This project strives to have sensible testing. The goal is not to have 100% test coverage but to have tests which _sufficiently_ ensure the functional completeness, functional correctness, maintainability, and accessibility of aoe2civexplorer. For more guidelines on software quality and accessibility, see [ISO/IEC 25010:2011](https://cdn.standards.iteh.ai/samples/35733/2ca18b477b7845a5b8cae39d6de0c098/ISO-IEC-25010-2011.pdf), [ISO/IEC 25010:2023](https://cdn.standards.iteh.ai/samples/78176/13ff8ea97048443f99318920757df124/ISO-IEC-25010-2023.pdf) and [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

This document lists each test, its purpose, and in which test file it resides. This document is an effort to mitigate redundant tests and test quality and also to aid in the trouble-shooting of potential false positives.

Test descriptions must remain brief and parameters (eg. Purpose) may not exceed 120 characters. Tests are ordered in order of their execution.

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
- [Test 10](#test-10): A partly marked branch shows a dash
- [Test 11](#test-11): A line's filter is named after its deepest mark
- [Test 12](#test-12): A line's filter button clears only its own kind of mark
- [Test 13](#test-13): A building heading a line reads Full, unless it holds upgrades
- [Test 14](#test-14): Marking a top-level group marks and shows all in it
- [Test 15](#test-15): Clear clears everything
- [Test 16](#test-16): A long press marks must lack, and a right-click clears it
- [Test 17](#test-17): Marking a line's end marks the whole line
- [Test 18](#test-18): Marking a line's end replaces must-lack marks above it
- [Test 19](#test-19): Marking all under an item marks the item
- [Test 20](#test-20): An optional item stays unmarked when all under it is
- [Test 21](#test-21): An optional item can be must-lack over must-have items
- [Test 22](#test-22): No item stays unmarked when all under it is marked
- [Test 23](#test-23): Marking every leaf marks every item but optional ones
- [Test 24](#test-24): Marking a unit or technology opens its line
- [Test 25](#test-25): A mark passes down a line only at the same count
- [Test 26](#test-26): A closed item shows its own and its full count
- [Test 27](#test-27): A closed line shows its first and last counts
- [Test 28](#test-28): An open item shows only its own count
- [Test 29](#test-29): Counts follow the filters
- [Test 30](#test-30): Expand all, Collapse all and the arrows work
- [Test 31](#test-31): Opening a branch opens its only children
- [Test 32](#test-32): Find highlights, opens to and counts matches
- [Test 33](#test-33): Find reports no match, and clears when emptied
- [Test 34](#test-34): The language menu is in Options, with every language
- [Test 35](#test-35): The language menu closes cleanly and Options keeps its size
- [Test 36](#test-36): Choosing a language changes the page
- [Test 37](#test-37): The language is kept in the address
- [Test 38](#test-38): Marks survive a language change
- [Test 39](#test-39): The page's text is in the chosen language
- [Test 40](#test-40): The tree is in the chosen language
- [Test 41](#test-41): No placeholders are left in the text
- [Test 42](#test-42): The footer names and links the source
- [Test 43](#test-43): The civ list is translated and sorted
- [Test 44](#test-44): Unique and universal items are hidden by default
- [Test 45](#test-45): Ticking Include shows every item, keeping marks
- [Test 46](#test-46): The Include choice is remembered
- [Test 47](#test-47): Options opens unticked, and Close returns focus

Accessibility tests:

- [Test 48](#test-48): Each language has a name and a valid tag
- [Test 49](#test-49): A filter button clears its item and focus moves on
- [Test 50](#test-50): Clearing the last filter moves focus and shows the hint
- [Test 51](#test-51): Right opens a line all the way down
- [Test 52](#test-52): Right and Left go into and out of branches
- [Test 53](#test-53): Up, Down, Home and End move through the tree
- [Test 54](#test-54): Down on an arrow goes to the next arrow
- [Test 55](#test-55): Enter goes to the first match
- [Test 56](#test-56): The page has a title and a language
- [Test 57](#test-57): Language tags are valid and choices are marked
- [Test 58](#test-58): One header, main, footer and main heading
- [Test 59](#test-59): Headings have text and skip no levels
- [Test 60](#test-60): Ids are unique and ARIA references resolve
- [Test 61](#test-61): Controls say what state they are in
- [Test 62](#test-62): Control names contain their visible text
- [Test 63](#test-63): Text contrast is at least 7:1, or 4.5:1 when large
- [Test 64](#test-64): Control borders have a contrast of at least 3:1
- [Test 65](#test-65): Targets are at least 44 by 44 pixels
- [Test 66](#test-66): The page does not scroll
- [Test 67](#test-67): Nothing sticks out sideways
- [Test 68](#test-68): Text is not justified and has 1.5 line spacing
- [Test 69](#test-69): No images, sounds, video or animations on the page
- [Test 70](#test-70): Down and End move through the language menu
- [Test 71](#test-71): Focus shows a thick, high-contrast outline
- [Test 72](#test-72): Nothing covers what has focus
- [Test 73](#test-73): Wider text spacing breaks nothing
- [Test 74](#test-74): Space unticks Include, keeping marks

Maintainability tests:

- [Test 75](#test-75): No comments in the code
- [Test 76](#test-76): No CSS or HTML in the scripts
- [Test 77](#test-77): script.js in the main folder, other scripts in js/, tests on demand
- [Test 78](#test-78): No script is over 400 lines of code
- [Test 79](#test-79): Page code in ui.js, data code in datahandler.js
- [Test 80](#test-80): No images, sounds, animations or dependencies in the sources
- [Test 81](#test-81): No game data in the scripts
- [Test 82](#test-82): Each item is in the tree once
- [Test 83](#test-83): Optional, upgrades and unique flags are well placed
- [Test 84](#test-84): Items a civ can do without are optional
- [Test 85](#test-85): Each item's availability names known civs
- [Test 86](#test-86): Counted texts have an "other" form
- [Test 87](#test-87): Translations keep their placeholders
- [Test 88](#test-88): Overrides name known items and civs
- [Test 89](#test-89): Source, tool texts and ignore list are filled in
- [Test 90](#test-90): The updater writes and reads back every value
- [Test 91](#test-91): Availability is stored in its shortest form
- [Test 92](#test-92): Stored names are already tidy
- [Test 93](#test-93): There are at most 100 tests

## Test 1

### File residence:
`js/tests/static.js`, line 77

### Purpose:
Prevent missing interface text in any language.

### Assertion expectation:
Every language has every interface text English has, and a name for every group.

## Test 2

### File residence:
`js/tests/static.js`, lines 78-81

### Purpose:
Prevent untranslated items and civilisations in the tree and the civ list.

### Assertion expectation:
Every language has a name for every item and every civilisation.

## Test 3

### File residence:
`js/tests/behaviour.js`, lines 15-17

### Purpose:
Verify that a left-click marks must have and the civ list and count follow (Req. 3, 4).

### Assertion expectation:
Item is "has" and aria-checked is true; list holds its civs in order; count reads "n compatible civilisations".

## Test 4

### File residence:
`js/tests/behaviour.js`, lines 18-19

### Purpose:
Verify that the Filters list appears when an item is marked (Req. 22, 23).

### Assertion expectation:
Exactly one filter button exists, labelled with the item's name and its must-have mark.

## Test 5

### File residence:
`js/tests/behaviour.js`, lines 21-22

### Purpose:
Verify that X marks must lack (Req. 3).

### Assertion expectation:
Item is "lacks", reads ", must lack", and the civs that have it leave the list.

## Test 6

### File residence:
`js/tests/behaviour.js`, line 25

### Purpose:
Verify that the menu key and right-click mark must lack (Req. 3).

### Assertion expectation:
After a contextmenu event the item is "lacks" and the browser's own menu is suppressed.

## Test 7

### File residence:
`js/tests/behaviour.js`, line 27

### Purpose:
Verify that Space clears a mark from the keyboard (Req. 3, WCAG 2.1.1).

### Assertion expectation:
Space on a must-have item leaves it unmarked.

## Test 8

### File residence:
`js/tests/behaviour.js`, lines 33-34

### Purpose:
Verify Req. 24 and 31: marking a building marks everything in it, and opens the way to all of it.

### Assertion expectation:
From closed, clicking a building makes it "has", and every item below it "has" and shown.

## Test 9

### File residence:
`js/tests/behaviour.js`, lines 35-36

### Purpose:
Verify Req. 24: a fully marked branch is listed as "Full <name>" in Filters.

### Assertion expectation:
Exactly one filter button exists, named "Full" plus the branch's name.

## Test 10

### File residence:
`js/tests/behaviour.js`, line 38

### Purpose:
Verify Req. 26: a branch whose contents have different marks shows a mixed checkbox.

### Assertion expectation:
After clicking the branch's first child again, its state and aria-checked are both "mixed".

## Test 11

### File residence:
`js/tests/behaviour.js`, lines 44-45

### Purpose:
Verify Req. 25: a marked line's filter entry is titled after its deepest must-have item.

### Assertion expectation:
Marking a line's first item names its one filter after the deepest item marked; marking its end renames it.

## Test 12

### File residence:
`js/tests/behaviour.js`, lines 48-49

### Purpose:
Ensure a filter button never clears marks it does not show.

### Assertion expectation:
With the line's last item must lack, the must-have filter button clears all others; the last item stays "lacks".

## Test 13

### File residence:
`js/tests/behaviour.js`, lines 52-53 and 56-57

### Purpose:
Verify Req. 24 and 25 for a building heading a line: "Full <name>", but upgrades take the deepest item's name.

### Assertion expectation:
A building at the top of a line reads "Full <name>"; one marked "upgrades": true reads its line's last item.

## Test 14

### File residence:
`js/tests/behaviour.js`, lines 62-63

### Purpose:
Verify that a top-level group passes its mark to everything in it, and shows it all (Req. 31).

### Assertion expectation:
From closed, clicking the group makes its state "has", while it holds no mark itself, and shows every item in it.

## Test 15

### File residence:
`js/tests/behaviour.js`, line 65

### Purpose:
Verify Req. 17: Clear removes every mark.

### Assertion expectation:
After Clear, no item has a mark.

## Test 16

### File residence:
`js/tests/behaviour.js`, line 99

### Purpose:
Verify marking by long press and right-click (Req. 3).

### Assertion expectation:
A 600 ms touch press marks the item "lacks"; a right-click on it then clears it.

## Test 17

### File residence:
`js/tests/behaviour.js`, lines 113-114

### Purpose:
Verify Req. 27: a line of single descendants takes the mark given to its deepest item.

### Assertion expectation:
Clicking a line's last item marks the whole line "has" and lists the right civs; clicking it again clears the line.

## Test 18

### File residence:
`js/tests/behaviour.js`, line 117

### Purpose:
Ensure a line never holds contradictory marks.

### Assertion expectation:
With the line's first item must lack, clicking its last item makes every item in the line "has".

## Test 19

### File residence:
`js/tests/behaviour.js`, line 120

### Purpose:
Keep an item's mark consistent with fully marked contents.

### Assertion expectation:
Clicking every leaf in a branch marks the branch itself "has".

## Test 20

### File residence:
`js/tests/behaviour.js`, lines 123-124

### Purpose:
Keep civs that do without an optional item, such as Folwark civs, in the results.

### Assertion expectation:
Marking all leaves under an optional item leaves it unmarked and mixed; the list matches the leaves alone.

## Test 21

### File residence:
`js/tests/behaviour.js`, lines 128-129

### Purpose:
Allow searching for civs that get an optional item's contents elsewhere.

### Assertion expectation:
An optional item stays "lacks" after everything under it is marked; the list is not empty and is correct.

## Test 22

### File residence:
`js/tests/behaviour.js`, line 134

### Purpose:
Catch items anywhere in the tree that fail to follow their contents' marks.

### Assertion expectation:
With a third of the leaves marked, then all, no non-optional item is unmarked while everything under it is marked.

## Test 23

### File residence:
`js/tests/behaviour.js`, lines 138-139

### Purpose:
Verify that marks travel up the whole tree correctly.

### Assertion expectation:
With every leaf marked, every item is "has", except optional items and those above them, which stay unmarked.

## Test 24

### File residence:
`js/tests/behaviour.js`, lines 150-151

### Purpose:
Verify Req. 28 and 31: marking a unit or technology opens it, showing every item marked with it.

### Assertion expectation:
Clicking a closed line item opens it down to the end of its line, so every item below it is shown.

## Test 25

### File residence:
`js/tests/behaviour.js`, lines 152-153 and 156-157

### Purpose:
Verify Req. 29 and 30: a mark passes down a line only to items held by as many civilisations.

### Assertion expectation:
Click, and X after the line's end is marked, mark only items with the same count; the list fits that item alone.

## Test 26

### File residence:
`js/tests/behaviour.js`, line 180

### Purpose:
Verify each item's compatible civilisations count (Req. 3).

### Assertion expectation:
Closed items with contents show "own–all" counts and other items their own count, on screen and to screen readers.

## Test 27

### File residence:
`js/tests/behaviour.js`, lines 181-182

### Purpose:
Verify that a closed upgrade line shows the range from its first item to its last upgrade.

### Assertion expectation:
The line's count reads its first item's civ count, then its last item's civ count.

## Test 28

### File residence:
`js/tests/behaviour.js`, line 184

### Purpose:
Avoid a misleading range once an item's contents are visible.

### Assertion expectation:
After Expand all, every item shows only its own count.

## Test 29

### File residence:
`js/tests/behaviour.js`, line 189

### Purpose:
Verify that the counts follow the active filters (Req. 3).

### Assertion expectation:
With a must-have and a must-lack mark, open and closed items count only the civs that fit the filters.

## Test 30

### File residence:
`js/tests/behaviour.js`, lines 202-203

### Purpose:
Verify Req. 18 and 19, and each branch's arrow.

### Assertion expectation:
Expand all opens every branch, Collapse all closes every branch, and a branch's arrow opens and closes it.

## Test 31

### File residence:
`js/tests/behaviour.js`, lines 204-209

### Purpose:
Save clicks by opening a line of only children in one step.

### Assertion expectation:
For every branch, its arrow opens exactly the chain of only children below it, and nothing else.

## Test 32

### File residence:
`js/tests/behaviour.js`, lines 247-249

### Purpose:
Verify Req. 20 and 21: the search highlights, opens to and counts its matches.

### Assertion expectation:
Exactly the matching items are highlighted and visible, and the label next to the search bar gives their number.

## Test 33

### File residence:
`js/tests/behaviour.js`, line 253

### Purpose:
Verify the search's feedback for no matches and for an empty search (Req. 21).

### Assertion expectation:
A search without matches says none found and highlights nothing; emptying the search empties the label.

## Test 34

### File residence:
`js/tests/interface.js`, lines 39-42

### Purpose:
Verify Req. 8 and 9: the Language menu is in the Options window and offers every language.

### Assertion expectation:
Options opens with focus on the menu, which opens to one option per language, each in its own language, current marked.

## Test 35

### File residence:
`js/tests/interface.js`, lines 48-49

### Purpose:
Verify Req. 12 and Rule 18: the language menu closes cleanly and nothing moves.

### Assertion expectation:
Escape closes the menu and refocuses its button; moving focus away closes it; the Options window never resizes.

## Test 36

### File residence:
`js/tests/interface.js`, lines 53-55

### Purpose:
Verify Req. 11: the page changes to the chosen language.

### Assertion expectation:
The page's lang and title change to the chosen language; the menu closes, refocuses its button and names the language.

## Test 37

### File residence:
`js/tests/interface.js`, line 56

### Purpose:
Keep the chosen language when the link is shared or the page reloaded.

### Assertion expectation:
The address holds lng=<chosen language>. Always passes when the page is opened as a file, as in CI.

## Test 38

### File residence:
`js/tests/interface.js`, line 57

### Purpose:
Ensure changing the language never loses the user's marks.

### Assertion expectation:
After a language change the marked item is still "has" and the civ list is unchanged.

## Test 39

### File residence:
`js/tests/interface.js`, lines 70-71

### Purpose:
Verify Req. 11 for all interface text, in every language.

### Assertion expectation:
Every element with data-text shows the chosen language's text for its key.

## Test 40

### File residence:
`js/tests/interface.js`, lines 72-73

### Purpose:
Verify Req. 11 for the tree, in every language.

### Assertion expectation:
Every tree label shows the chosen language's item or group name.

## Test 41

### File residence:
`js/tests/interface.js`, line 74

### Purpose:
Catch unfilled {placeholders} shown to users.

### Assertion expectation:
No visible text on the page contains { or }.

## Test 42

### File residence:
`js/tests/interface.js`, lines 75-76

### Purpose:
Verify Req. 5: the footer credits the data source.

### Assertion expectation:
The footer holds a link whose text and address are the source's name and URL from data.json.

## Test 43

### File residence:
`js/tests/interface.js`, line 79

### Purpose:
Verify that the civ list is translated and sorted alphabetically in every language (Req. 4).

### Assertion expectation:
With a must-have and a must-lack mark, the list holds the right civs' names, sorted in the chosen language.

## Test 44

### File residence:
`js/tests/interface.js`, lines 87-89

### Purpose:
Verify Req. 13 and 15: by default the tree leaves out unique and universal items.

### Assertion expectation:
No item from a unique group is shown, and every shown leaf is held by more than one civ but not by all.

## Test 45

### File residence:
`js/tests/interface.js`, lines 98-100

### Purpose:
Verify Req. 14 and 15: ticking Include Unique and Universal shows every item and keeps marks.

### Assertion expectation:
The box is ticked, every item is in the tree, and the marked item and the civ list are unchanged.

## Test 46

### File residence:
`js/tests/interface.js`, line 101

### Purpose:
Keep the Include Unique and Universal choice for the next visit.

### Assertion expectation:
Browser storage holds include=true after ticking. Passes when the browser offers no storage.

## Test 47

### File residence:
`js/tests/interface.js`, lines 103-104

### Purpose:
Verify Req. 7, 13 and 16, and that focus returns when the Options window closes (WCAG 2.4.3).

### Assertion expectation:
The Options button opens the window with the box unticked; Close closes it and returns focus to the Options button.

## Test 48

### File residence:
`js/tests/static.js`, lines 85-86

### Purpose:
Keep the language menu and the page's lang attributes correct (WCAG 3.1.1, 3.1.2).

### Assertion expectation:
Every language has a name and a well-formed language tag.

## Test 49

### File residence:
`js/tests/behaviour.js`, lines 76-77

### Purpose:
Verify that filter buttons remove filters without losing keyboard focus (WCAG 2.4.3).

### Assertion expectation:
Clicking the first filter button clears its item and moves focus to the next filter button.

## Test 50

### File residence:
`js/tests/behaviour.js`, lines 79-81

### Purpose:
Keep focus and guidance sensible once no filters remain (WCAG 2.4.3).

### Assertion expectation:
Focus is on the Civilisations heading, the list is empty, the start hint shows and the Filters list is hidden.

## Test 51

### File residence:
`js/tests/behaviour.js`, lines 216-217

### Purpose:
Give keyboard users the same one-step opening of a line (WCAG 2.1.1).

### Assertion expectation:
Right on a line's first item opens exactly that line's chain of only children.

## Test 52

### File residence:
`js/tests/behaviour.js`, line 231

### Purpose:
Verify keyboard navigation into and out of branches (WCAG 2.1.1).

### Assertion expectation:
Right opens a branch, Right again focuses its first child, Left returns to the branch, Left again closes it.

## Test 53

### File residence:
`js/tests/behaviour.js`, lines 235-236

### Purpose:
Verify keyboard movement through the tree (WCAG 2.1.1).

### Assertion expectation:
Up on the first item stays put, Down moves to the next, End focuses the last top item and Home the first.

## Test 54

### File residence:
`js/tests/behaviour.js`, line 239

### Purpose:
Let keyboard users move between branch arrows directly.

### Assertion expectation:
Down on the first branch's arrow focuses the second branch's arrow.

## Test 55

### File residence:
`js/tests/behaviour.js`, lines 261-262

### Purpose:
Let keyboard users jump from the search bar to the results (WCAG 2.1.1).

### Assertion expectation:
Enter in the search bar focuses the first match.

## Test 56

### File residence:
`js/tests/audit.js`, line 79

### Purpose:
WCAG 2.4.2 and 3.1.1: the page has a title and states its language.

### Assertion expectation:
The page title is not empty and the page's lang is the current language's tag.

## Test 57

### File residence:
`js/tests/audit.js`, lines 80-83

### Purpose:
WCAG 3.1.2: screen readers pronounce each language's name in that language.

### Assertion expectation:
Every lang attribute is well formed, and each language option's lang is that language's tag.

## Test 58

### File residence:
`js/tests/audit.js`, lines 85-86

### Purpose:
WCAG 1.3.1: landmarks and a main heading let assistive technology find its way around the page.

### Assertion expectation:
There is exactly one header, one main, one footer and one visible h1.

## Test 59

### File residence:
`js/tests/audit.js`, lines 87-88

### Purpose:
WCAG 1.3.1 and 2.4.10: the headings form a clear outline.

### Assertion expectation:
Every visible heading has text and is at most one level below the heading before it.

## Test 60

### File residence:
`js/tests/audit.js`, lines 90-95

### Purpose:
WCAG 4.1.2: labels and relationships resolve for assistive technology.

### Assertion expectation:
No id repeats, and every id in aria-labelledby, aria-controls and aria-describedby exists.

## Test 61

### File residence:
`js/tests/audit.js`, lines 96-100

### Purpose:
WCAG 4.1.2: assistive technology can read each control's state.

### Assertion expectation:
Checkboxes have aria-checked true, false or mixed; arrows and the menu button have aria-expanded matching the screen.

## Test 62

### File residence:
`js/tests/audit.js`, lines 102-106

### Purpose:
WCAG 2.5.3 and 4.1.2: every control has a name matching what users see.

### Assertion expectation:
Every control has an accessible name, and, except for text inputs, that name contains its visible text.

## Test 63

### File residence:
`js/tests/audit.js`, lines 107-116

### Purpose:
WCAG 1.4.6 (AAA): text has enhanced contrast.

### Assertion expectation:
All visible text has a contrast of at least 7:1 with its background, or 4.5:1 for large text.

## Test 64

### File residence:
`js/tests/audit.js`, lines 117-123

### Purpose:
WCAG 1.4.11: the edges of controls are visible.

### Assertion expectation:
Buttons, filter buttons, inputs and checkboxes with a border have a border contrast of at least 3:1.

## Test 65

### File residence:
`js/tests/audit.js`, lines 127-130

### Purpose:
WCAG 2.5.5 (AAA): targets are large enough to hit.

### Assertion expectation:
Every focusable control, except links inside running text, is at least 44 by 44 CSS pixels.

## Test 66

### File residence:
`js/tests/audit.js`, lines 131-132

### Purpose:
Enforce Rule 12: no page scrolling.

### Assertion expectation:
The page is no taller and no wider than the window.

## Test 67

### File residence:
`js/tests/audit.js`, lines 133-136

### Purpose:
WCAG 1.4.10: content reflows without scrolling sideways.

### Assertion expectation:
No visible element extends past the left or right edge of the window.

## Test 68

### File residence:
`js/tests/audit.js`, lines 137-140

### Purpose:
WCAG 1.4.8 (AAA): text is presented readably.

### Assertion expectation:
No paragraph or list item is justified, and each has a line height of at least 1.5 times its font size.

## Test 69

### File residence:
`js/tests/audit.js`, lines 141-148

### Purpose:
Enforce Rules 9, 10 and 11 on the page as rendered.

### Assertion expectation:
No media elements, no images in CSS, no running animations and no animation or transition styles.

## Test 70

### File residence:
`js/tests/interface.js`, lines 129-130

### Purpose:
Verify keyboard use of the language menu (WCAG 2.1.1).

### Assertion expectation:
Down on the menu button opens the menu at the current language; Down moves one on; End reaches the last language.

## Test 71

### File residence:
`js/tests/audit.js`, lines 43-52 and 69

### Purpose:
WCAG 2.4.7 and 2.4.13 (AAA): keyboard focus is clearly visible.

### Assertion expectation:
Every focusable element takes focus and shows an outline at least 2 px wide with a contrast of at least 3:1.

## Test 72

### File residence:
`js/tests/audit.js`, lines 53-66 and 70

### Purpose:
WCAG 2.4.12 (AAA): nothing hides the element that has focus.

### Assertion expectation:
The centre of the visible part of each focused element is that element, not something covering it.

## Test 73

### File residence:
`js/tests/interface.js`, lines 152-155

### Purpose:
WCAG 1.4.12: wider text spacing set by the user does not break the layout.

### Assertion expectation:
With WCAG's text spacing applied, the page and every element stay within the window's width.

## Test 74

### File residence:
`js/tests/interface.js`, lines 169-170

### Purpose:
Verify that the Include Unique and Universal box works from the keyboard (WCAG 2.1.1).

### Assertion expectation:
Space unticks the box, the unique and universal items leave the tree, and the marks and the civ list are unchanged.

## Test 75

### File residence:
`js/tests/static.js`, lines 44-48

### Purpose:
Enforce Rule 7: no comments in the code.

### Assertion expectation:
index.html, style.css and every script hold no comment markers. The comment live-server injects is ignored.

## Test 76

### File residence:
`js/tests/static.js`, line 49

### Purpose:
Enforce Rule 2: no CSS or HTML inside the JavaScript.

### Assertion expectation:
No script sets inline styles, writes HTML strings, or calls createElement or document.write.

## Test 77

### File residence:
`js/tests/static.js`, lines 50-55

### Purpose:
Enforce Rules 2 and 16, and keep the tests out of what visitors download.

### Assertion expectation:
script.js is in the main folder and every other script in js/; imports point into js/; only js/tests/ loads on demand.

## Test 78

### File residence:
`js/tests/static.js`, lines 59-60

### Purpose:
Keep every script small enough to read and maintain.

### Assertion expectation:
No script reached from script.js has over 400 lines of code. Blank lines do not count.

## Test 79

### File residence:
`js/tests/static.js`, lines 61-64

### Purpose:
Keep page code in ui.js and data loading and storage in datahandler.js.

### Assertion expectation:
Outside js/tests/, only ui.js uses document, window or DOM queries, and only datahandler.js uses fetch or localStorage.

## Test 80

### File residence:
`js/tests/static.js`, lines 65-70

### Purpose:
Enforce Rules 9, 10, 11 and 14 in the source files.

### Assertion expectation:
No media tags in HTML; no url(), animation, transition or @import in CSS; no Audio, animate() or require() in JS.

## Test 81

### File residence:
`js/tests/static.js`, lines 71-72

### Purpose:
Enforce Rule 1: game data lives only in data.json.

### Assertion expectation:
No civilisation or item name from data.json appears as a quoted string in any script.

## Test 82

### File residence:
`js/tests/static.js`, line 92

### Purpose:
Prevent duplicate items in the tree, which would break counts and marking.

### Assertion expectation:
Every item appears exactly once in the tree in data.json.

## Test 83

### File residence:
`js/tests/static.js`, lines 96-99

### Purpose:
Catch misplaced or mistyped "optional", "upgrades" and "unique" flags in data.json.

### Assertion expectation:
"optional" and "upgrades" are true and only on items with something under them; "unique" is true and only on groups.

## Test 84

### File residence:
`js/tests/static.js`, lines 109-110

### Purpose:
Flag items a game update made optional, so that marking what is under them does not wrongly mark them.

### Assertion expectation:
No civ has everything under a non-optional item without having the item, with or without unique and universal items.

## Test 85

### File residence:
`js/tests/static.js`, lines 111-114

### Purpose:
Ensure every item's availability is defined and names real civilisations.

### Assertion expectation:
Each item's availability is "all", or a has or lacks list naming only civilisations in data.json.

## Test 86

### File residence:
`js/tests/static.js`, lines 115-116

### Purpose:
Ensure counted texts have a fallback form for any number.

### Assertion expectation:
Every counted (plural) text in every language has an "other" form.

## Test 87

### File residence:
`js/tests/static.js`, lines 120-121

### Purpose:
Prevent translations that lose or misspell placeholders such as {n}.

### Assertion expectation:
Each interface text has the same {placeholders} in every language as in English.

## Test 88

### File residence:
`js/tests/static.js`, lines 122-123

### Purpose:
Catch stale or misspelt name corrections after a game update.

### Assertion expectation:
Every key in each language's overrides is a known item or civilisation.

## Test 89

### File residence:
`js/tests/static.js`, lines 124-129

### Purpose:
Ensure the footer, the updater and the tests have the data they need (Req. 5).

### Assertion expectation:
source has name, url, data, an integer helpOffset and a YYYY-MM date; no tool text is empty; ignore is a list of text.

## Test 90

### File residence:
`js/tests/static.js`, lines 137-139

### Purpose:
Ensure the updater writes data.json and the locale files without losing or changing data.

### Assertion expectation:
Writer outputs data.json plus one locales/ file per other language; reading them back gives identical data.

## Test 91

### File residence:
`js/tests/static.js`, lines 140-141

### Purpose:
Keep data.json compact and identical to what the updater would write.

### Assertion expectation:
Each item's availability is "all", or whichever of the has or lacks lists is shorter.

## Test 92

### File residence:
`js/tests/static.js`, lines 142-144

### Purpose:
Keep stored names identical to what the updater would write.

### Assertion expectation:
Joining lines and tidying spaces leaves every stored item and civilisation name unchanged, in every language.

## Test 93

### File residence:
`js/tests/run.js`, line 96

### Purpose:
Enforce Rule 17: at most 100 tests.

### Assertion expectation:
The number of tests in the report, this one included, is at most 100.
