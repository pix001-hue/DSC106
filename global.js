// Shared behavior for every page in the portfolio.
console.log("IT'S ALIVE!");

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

const themeSelect = document.querySelector('.color-scheme select');

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
