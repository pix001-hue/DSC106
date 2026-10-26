// Shared behavior for every page in the portfolio.
console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/'
    : '/DSC106/';

const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/pix001-hue', title: 'GitHub' },
];

const nav = document.createElement('nav');
nav.setAttribute('aria-label', 'Primary navigation');

for (const page of pages) {
  const url = page.url.startsWith('http') ? page.url : BASE_PATH + page.url;
  const link = document.createElement('a');
  link.href = url;
  link.textContent = page.title;

  const isCurrentPage =
    link.host === location.host && link.pathname === location.pathname;
  link.classList.toggle('current', isCurrentPage);
  if (isCurrentPage) link.setAttribute('aria-current', 'page');

  if (link.host !== location.host) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  nav.append(link);
}

document.body.prepend(nav);

document.body.insertAdjacentHTML(
  'afterbegin',
  `<label class="color-scheme">Theme:
    <select aria-label="Color theme">
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>`,
);

const [themeSelect] = $$('.color-scheme select');

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  themeSelect.value = colorScheme;
}

if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

themeSelect.addEventListener('input', (event) => {
  const colorScheme = event.target.value;
  setColorScheme(colorScheme);
  localStorage.colorScheme = colorScheme;
});

const form = document.querySelector('form[action^="mailto:"]');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const parameters = [];

  for (const [name, value] of data) {
    parameters.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
  }

  location.href = `${form.action}?${parameters.join('&')}`;
});

// Shared data helpers for the Projects page and home page.
export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
    return null;
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!containerElement) {
    console.error('A projects container is required.');
    return;
  }

  containerElement.innerHTML = '';

  if (!Array.isArray(projects) || projects.length === 0) {
    containerElement.textContent = 'No projects to display.';
    return;
  }

  const heading = /^h[1-6]$/.test(headingLevel) ? headingLevel : 'h2';
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

  for (const project of projects) {
    const article = document.createElement('article');
    const title = escapeHTML(project.title || 'Untitled project');
    const image = escapeHTML(project.image || 'https://vis-society.github.io/labs/2/images/empty.svg');
    const description = escapeHTML(project.description || 'No description available.');

    article.innerHTML = `
      <${heading}>${title}</${heading}>
      <img src="${image}" alt="${title}">
      <div class="project-details"><p>${description}</p><p class="project-year">${escapeHTML(project.year ?? 'Year unavailable')}</p></div>
    `;
    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${encodeURIComponent(username)}`);
}
