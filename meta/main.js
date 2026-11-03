import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const repoURL = 'https://github.com/pix001-hue/DSC106';
const tooltip = document.querySelector('#commit-tooltip');
let hideTimer;

async function loadData() {
  return d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(`${row.date}T00:00${row.timezone}`),
    datetime: new Date(row.datetime),
  }));
}

function processCommits(data) {
  return d3.groups(data, (d) => d.commit).map(([id, lines]) => {
    const { author, date, time, timezone, datetime } = lines[0];
    const commit = {
      id, author, date, time, timezone, datetime,
      url: `${repoURL}/commit/${id}`,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60 + datetime.getSeconds() / 3600,
      totalLines: lines.length,
    };
    Object.defineProperty(commit, 'lines', { value: lines, enumerable: false });
    return commit;
  });
}

function renderCommitInfo(data, commits) {
  const fileLengths = d3.rollups(data, (rows) => d3.max(rows, (d) => d.line), (d) => d.file);
  const stats = [
    ['Total LOC', d3.format(',')(data.length)],
    ['Total commits', commits.length],
    ['Files', fileLengths.length],
    ['Average file length', `${d3.format('.1f')(d3.mean(fileLengths, (d) => d[1]))} lines`],
    ['Longest line', `${d3.max(data, (d) => d.length)} characters`],
    ['Maximum depth', d3.max(data, (d) => d.depth)],
  ];
  const container = d3.select('#stats').text('').append('dl').attr('class', 'stats');
  for (const [label, value] of stats) {
    const item = container.append('div');
    item.append('dt').text(label);
    item.append('dd').text(value);
  }
}

function renderTooltipContent(commit) {
  const link = document.querySelector('#commit-link');
  link.href = commit.url;
  link.textContent = commit.id.slice(0, 8);
  document.querySelector('#commit-date').textContent = commit.datetime.toLocaleDateString('en', { dateStyle: 'long' });
  document.querySelector('#commit-time').textContent = commit.datetime.toLocaleTimeString('en', { timeStyle: 'short' });
  document.querySelector('#commit-author').textContent = commit.author;
  document.querySelector('#commit-lines').textContent = d3.format(',')(commit.totalLines);
}

function updateTooltipPosition(event) {
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = event.clientX ?? bounds.right;
  const y = event.clientY ?? bounds.top;
  tooltip.style.left = `${Math.max(8, Math.min(x + 12, innerWidth - tooltip.offsetWidth - 8))}px`;
  tooltip.style.top = `${Math.max(8, Math.min(y + 12, innerHeight - tooltip.offsetHeight - 8))}px`;
}

function hideTooltip() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => { tooltip.hidden = true; }, 180);
}

tooltip.addEventListener('mouseenter', () => clearTimeout(hideTimer));
tooltip.addEventListener('mouseleave', hideTooltip);
tooltip.addEventListener('focusin', () => clearTimeout(hideTimer));
tooltip.addEventListener('focusout', hideTooltip);

function renderLanguageBreakdown(selectedCommits) {
  const container = d3.select('#language-breakdown');
  container.selectAll('*').remove();
  const lines = selectedCommits.flatMap((d) => d.lines);
  const breakdown = d3.rollups(lines, (rows) => rows.length, (d) => d.type)
    .sort((a, b) => d3.descending(a[1], b[1]));
  const names = { js: 'JavaScript', html: 'HTML', css: 'CSS', svelte: 'Svelte' };
  for (const [language, count] of breakdown) {
    const item = container.append('div');
    item.append('dt').text(names[language] || language);
    item.append('dd').text(`${count} lines (${d3.format('.1~%')(count / lines.length)})`);
  }
}

function renderScatterPlot(commits) {
  const width = 1000;
  const height = 520;
  const margin = { top: 35, right: 35, bottom: 60, left: 65 };
  const area = { left: margin.left, right: width - margin.right, top: margin.top, bottom: height - margin.bottom };
  const [first, last] = d3.extent(commits, (d) => d.datetime);
  // Padding keeps bubbles inside the plot, including for a single commit.
  const padding = Math.max((last - first) * 0.05, 12 * 60 * 60 * 1000);
  const xScale = d3.scaleTime().domain([new Date(+first - padding), new Date(+last + padding)]).range([area.left, area.right]).nice();
  const yScale = d3.scaleLinear().domain([0, 24]).range([area.bottom, area.top]);
  // A zero origin makes circle area exactly proportional to surviving lines.
  const rScale = d3.scaleSqrt().domain([0, d3.max(commits, (d) => d.totalLines)]).range([0, 25]);
  const svg = d3.select('#chart').append('svg').attr('viewBox', `0 0 ${width} ${height}`)
    .attr('aria-labelledby', 'chart-heading').attr('aria-describedby', 'chart-help');
  svg.append('g').attr('class', 'gridlines').attr('transform', `translate(${area.left},0)`)
    .call(d3.axisLeft(yScale).ticks(8).tickFormat('').tickSize(-(area.right - area.left)));
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${area.bottom})`)
    .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat('%b %d')));
  svg.append('g').attr('class', 'axis').attr('transform', `translate(${area.left},0)`)
    .call(d3.axisLeft(yScale).ticks(8).tickFormat((hour) => `${String(hour).padStart(2, '0')}:00`));
  svg.append('text').attr('class', 'axis-label').attr('x', (area.left + area.right) / 2).attr('y', height - 12).text('Commit date');
  svg.append('text').attr('class', 'axis-label').attr('transform', `translate(16,${(area.top + area.bottom) / 2}) rotate(-90)`).text('Time of day');

  // Put the brush below circles so hover and keyboard interaction remain available.
  const brushGroup = svg.append('g').attr('class', 'brush');
  const dots = svg.append('g').attr('class', 'dots').selectAll('circle')
    .data(d3.sort(commits, (d) => -d.totalLines)).join('circle')
    .attr('cx', (d) => xScale(d.datetime)).attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines)).attr('tabindex', 0).attr('role', 'link')
    .attr('aria-label', (d) => `Commit ${d.id.slice(0, 8)}, ${d.datetime.toLocaleString()}, ${d.totalLines} lines. Press Enter to open on GitHub.`)
    .on('mouseenter focus', (event, commit) => {
      clearTimeout(hideTimer);
      renderTooltipContent(commit);
      tooltip.hidden = false;
      updateTooltipPosition(event);
    })
    .on('mousemove', updateTooltipPosition)
    .on('mouseleave blur', hideTooltip)
    .on('keydown', (event, commit) => {
      if (event.key === 'Enter') window.open(commit.url, '_blank', 'noopener,noreferrer');
      if (event.key === 'Escape') tooltip.hidden = true;
    });

  function isCommitSelected(selection, commit) {
    if (!selection) return false;
    const [[x0, y0], [x1, y1]] = selection;
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);
    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
  }

  const brush = d3.brush().extent([[area.left, area.top], [area.right, area.bottom]])
    .on('start brush end', (event) => {
      clearTimeout(hideTimer);
      tooltip.hidden = true;
      const selected = commits.filter((commit) => isCommitSelected(event.selection, commit));
      dots.classed('selected', (commit) => isCommitSelected(event.selection, commit));
      document.querySelector('#selection-count').textContent = selected.length
        ? `${selected.length} commit${selected.length === 1 ? '' : 's'} selected` : 'No commits selected';
      document.querySelector('#clear-selection').disabled = !event.selection;
      renderLanguageBreakdown(selected);
    });
  brushGroup.call(brush);
  document.querySelector('#clear-selection').addEventListener('click', () => brushGroup.call(brush.move, null));
}

try {
  const data = await loadData();
  if (!data.length) throw new Error('The code analysis CSV is empty.');
  if (data.some((d) => !Number.isFinite(+d.datetime) || !Number.isFinite(d.length))) {
    throw new Error('The code analysis CSV contains invalid dates or numbers.');
  }
  const commits = processCommits(data);
  renderCommitInfo(data, commits);
  document.querySelector('#timezone-note').textContent = `Dates and times use your browser’s timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}.`;
  renderScatterPlot(commits);
} catch (error) {
  document.querySelector('#stats').textContent = 'Code statistics could not be loaded. Serve this site over HTTP and check that meta/loc.csv is available.';
  console.error('Unable to load code analysis:', error);
}
