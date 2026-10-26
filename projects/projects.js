import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json') || [];
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');
const svg = d3.select('#projects-pie-plot');
const legend = d3.select('.legend');
const status = document.querySelector('#filter-status');
const projectsTitle = document.querySelector('.projects-title');
const color = d3.scaleOrdinal(d3.schemeTableau10);
const arc = d3.arc().innerRadius(0).outerRadius(48);

let query = '';
let selectedYear = null;

function matchingProjects() {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return projects.filter((project) => {
    const values = Object.values(project).join('\n').toLocaleLowerCase();
    return values.includes(normalizedQuery);
  });
}

function update() {
  const searchedProjects = matchingProjects();
  const visibleProjects = selectedYear === null
    ? searchedProjects
    : searchedProjects.filter((project) => String(project.year) === selectedYear);

  renderProjects(visibleProjects, projectsContainer, 'h2');
  if (projectsTitle) projectsTitle.textContent = `Projects (${visibleProjects.length})`;
  status.textContent = selectedYear === null
    ? `Showing ${visibleProjects.length} of ${projects.length} projects.`
    : `Showing ${visibleProjects.length} of ${searchedProjects.length} matching projects from ${selectedYear}.`;

  const data = d3.rollups(searchedProjects, (values) => values.length, (project) => String(project.year ?? 'Unknown'))
    .sort(([a], [b]) => d3.descending(a, b))
    .map(([year, count]) => ({ label: year, value: count }));
  const pieData = d3.pie().value((item) => item.value).sort(null)(data);

  svg.selectAll('*').remove();
  legend.selectAll('*').remove();

  svg.selectAll('path')
    .data(pieData)
    .join('path')
    .attr('d', arc)
    .attr('fill', (item) => color(item.data.label))
    .attr('class', (item) => item.data.label === selectedYear ? 'selected' : null)
    .attr('role', 'button')
    .attr('tabindex', 0)
    .attr('aria-label', (item) => `${item.data.label}: ${item.data.value} projects`)
    .attr('aria-pressed', (item) => item.data.label === selectedYear)
    .on('click keydown', function (event, item) {
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
      if (event.type === 'keydown') event.preventDefault();
      selectedYear = selectedYear === item.data.label ? null : item.data.label;
      update();
    });

  const items = legend.selectAll('li').data(data).join('li');
  items.append('button')
    .attr('type', 'button')
    .attr('class', (item) => `legend-button${item.label === selectedYear ? ' selected' : ''}`)
    .attr('aria-pressed', (item) => item.label === selectedYear)
    .style('--color', (item) => color(item.label))
    .html((item) => `<span class="swatch" aria-hidden="true"></span>${item.label} <em>(${item.value})</em>`)
    .on('click', (_, item) => {
      selectedYear = selectedYear === item.label ? null : item.label;
      update();
    });
}

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  update();
});

update();
