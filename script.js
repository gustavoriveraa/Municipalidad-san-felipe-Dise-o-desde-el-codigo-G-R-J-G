const menuToggle = document.querySelector('#menuToggle');
const sidebar = document.querySelector('#sidebar');
const navLinks = document.querySelectorAll('.main-nav a');
const mobileQuery = window.matchMedia('(max-width: 760px)');

function syncSidebarA11y() {
  if (!sidebar) return;
  const isClosedMobile = mobileQuery.matches && !sidebar.classList.contains('open');
  if (isClosedMobile) {
    sidebar.inert = true;
    sidebar.setAttribute('aria-hidden', 'true');
  } else {
    sidebar.inert = false;
    sidebar.removeAttribute('aria-hidden');
  }
}

function closeMenu() {
  if (!sidebar || !menuToggle) return;
  sidebar.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
  syncSidebarA11y();
}

if (menuToggle && sidebar) {
  menuToggle.setAttribute('aria-controls', 'sidebar');
  menuToggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    syncSidebarA11y();
  });
  syncSidebarA11y();
}

const currentPage = window.location.pathname.split('/').pop() || 'index.html';

function setActiveLink(activeLink) {
  navLinks.forEach((link) => {
    const isActive = link === activeLink;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

navLinks.forEach((link) => {
  if (link.getAttribute('href') === currentPage) {
    setActiveLink(link);
  }
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    setActiveLink(link);

    if (mobileQuery.matches) {
      closeMenu();
    }
  });
});

// Los enlaces con href="#" son marcadores de posición.
// Reemplaza esos valores por las direcciones oficiales correspondientes.
document.addEventListener('click', (event) => {
  const placeholderLink = event.target.closest('a[href="#"]');
  if (!placeholderLink) return;
  event.preventDefault();
  const label = placeholderLink.getAttribute('aria-label') || placeholderLink.textContent.trim() || 'Este enlace';
  console.info(`${label}: agrega aquí la URL correspondiente.`);
});

const resourceItems = document.querySelectorAll('.resource-item');
const panel = document.querySelector('#resourceDropdownPanel');

if (panel) {
  resourceItems.forEach((item) => {
    const summary = item.querySelector('.resource-card');
    if (summary) summary.setAttribute('aria-controls', 'resourceDropdownPanel');
  });
}

function closeResourcePanel() {
  const openItem = [...resourceItems].find((item) => item.open);
  if (!openItem) return;
  openItem.open = false;
  const summary = openItem.querySelector('.resource-card');
  if (summary) summary.focus();
}

function updateResourcePanel() {
  if (!panel) return;
  const openItem = [...resourceItems].find((item) => item.open);

  if (openItem) {
    const name = openItem.querySelector('.resource-name').textContent.trim();
    panel.innerHTML = `
      <div class="resource-dropdown-panel__info">
        <button type="button" class="resource-panel-close" aria-label="Cerrar enlaces de ${name}">Cerrar <span aria-hidden="true">×</span></button>
        <p class="eyebrow">Enlaces de interés</p>
        <h3 id="resourcePanelTitle" tabindex="-1">${name}</h3>
        <p>${openItem.dataset.description || 'Selecciona uno de los recursos disponibles para este apartado.'}</p>
      </div>
      <div class="resource-dropdown-panel__links">
        ${openItem.querySelector('.resource-dropdown').innerHTML}
      </div>
    `;
    panel.classList.add('open');
    const title = panel.querySelector('#resourcePanelTitle');
    if (title) title.focus();
  } else {
    panel.innerHTML = '';
    panel.classList.remove('open');
  }
}

resourceItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      resourceItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    }
    updateResourcePanel();
  });
});

if (panel) {
  panel.addEventListener('click', (event) => {
    if (event.target.closest('.resource-panel-close')) {
      closeResourcePanel();
    }
  });
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeResourcePanel();
    }
  });
}

// Cierra el menú al hacer clic fuera de él en pantallas pequeñas.
document.addEventListener('click', (event) => {
  if (!sidebar || !menuToggle || !mobileQuery.matches) return;
  const isClickInside = sidebar.contains(event.target) || menuToggle.contains(event.target);
  if (!isClickInside && sidebar.classList.contains('open')) {
    closeMenu();
  }
});

// Cierra el menú al pasar a una pantalla donde la barra lateral es fija.
window.addEventListener('resize', () => {
  if (!mobileQuery.matches) {
    closeMenu();
  } else {
    syncSidebarA11y();
  }
});
