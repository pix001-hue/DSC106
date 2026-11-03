# DSC106 portfolio

Live site: https://pix001-hue.github.io/DSC106/

## Preview

From this directory, run `python3 -m http.server 8000`, then open
http://localhost:8000/meta/. Use an HTTP server instead of opening the HTML file
directly because D3 fetches the CSV. D3 loads from jsDelivr, as in Lab 5.

## Lab 6

The Meta page includes six summary statistics, a date/time scatterplot with axes
and horizontal gridlines, commit tooltips and GitHub links, square-root bubble
sizing, brushing, a selected-commit count, and selected-language line counts and
percentages. Smaller circles are drawn last. Clear selection resets the brush;
keyboard users can focus circles and press Enter to visit the commit.

`meta/loc.csv` is real Git-blame data from repository commit
`0842724b` (Lab 5, October 25, 2026 in Los Angeles): 798 lines across 8 source
files, attributed to 11 commits. Only commits with surviving lines appear.
It is not a count of all lines ever added/deleted. Times are displayed in the
viewer's browser timezone. The supplied folder had no `.git`, so the initial
CSV was generated against the original GitHub history in a temporary checkout,
using elocuent's analyzer. No synthetic commits were created.

To refresh after committing your changes in the actual Git repository:

```sh
npm install
npm run analyze
npm run check
```

Commit `meta/loc.csv` along with the source. Do not commit `node_modules/`.
After refreshing, update the snapshot date in `meta/index.html` to match the
analyzed revision. The analyzer needs real Git history; a ZIP/source-only copy
cannot supply it.

## Check-off recording

Record an MP4 of at most one minute, with spoken explanation:

1. Show the Meta summary and quantitative scatterplot.
2. Hover a circle, brush a group, show selected counts and language percentages,
   and clear the selection.
3. Explain one thing you learned, for example why a square-root radius scale
   makes circle area proportional to line count.
