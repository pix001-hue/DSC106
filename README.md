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

## Lab 8: Animation & Scrollytelling

The Meta page now includes a date slider, keyed commit circles with CSS entry
transitions, a sticky scatterplot driven by Scrollama, and a file unit visualization.
Each dot in the file view represents one surviving line; files are sorted by line
count and dots are colored by technology. Statistics and file units follow the
same cutoff as the chart. Scroll upward to replay earlier commits, or use Show all.
Hover, keyboard commit links, brushing, and language breakdowns remain available.
Filtering clears the old brush so it never describes hidden commits.

The CSV is still the original October 25 snapshot: 798 lines and 11 commits.
The narrative describes surviving contributions, not the exact historical file
sizes (deleted lines are not present in a Git-blame snapshot). No invented history
or additional dataset is used. File-size scrollytelling is optional and is not
implemented as a separate story.

### Upload

Replace these files in the original repository, preserving paths:

- `meta/index.html`
- `meta/main.js`
- `style.css`
- `README.md` (updated instructions)

Keep the existing `meta/loc.csv` and other site files. Upload the contents of
`DSC106`, not a new enclosing `lab8` directory. There is no build step. The page
loads D3 and Scrollama from jsDelivr and needs an internet connection.

### Validation

`npm run check` checks JavaScript syntax. Also preview `/meta/` over HTTP and check:

1. Move the slider to both ends: the chart, file dots, and statistics update.
2. Scroll down and back up: the active story and commit count follow the scroll.
3. Hover/focus a circle, brush a group, and clear the selection.
4. Scroll to the file visualization: the full snapshot has 798 dots in 8 files.
5. Check a narrow window and reduced-motion settings.

### Check-off recording (at most 60 seconds)

Record your laptop screen with spoken explanation, in this order:

1. **0–30 seconds:** Scroll down and up through several commit descriptions to
   show the pinned scatterplot updating. Explain that each circle represents a
   commit and its area represents surviving lines.
2. **30–45 seconds:** Show the file unit visualization. Explain that one dot is
   one line, files are ranked by size, and colors identify HTML, CSS, or JavaScript.
3. **45–60 seconds:** Explain one lesson: “I learned that using the commit ID as
   the D3 join key preserves each circle's identity as the filtered data changes.
   Scrollama lets scrolling control the same timeline as the slider.”

Submit the recording separately as required by the course. Uploading code alone
does not replace the video submission.
