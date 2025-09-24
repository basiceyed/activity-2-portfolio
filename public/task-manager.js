document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const toggleDark = document.getElementById('toggle-dark');
  const editBtn = document.getElementById('edit-about-btn');
  const aboutContent = document.getElementById('about-content');

  const STORAGE_KEYS = {
    THEME: 'theme',
    ABOUT: 'aboutMe'
  };

  // ----------------------
  // Theme Functions
  // ----------------------
  const applyTheme = (theme) => {
    body.setAttribute('data-theme', theme);
    toggleDark.checked = theme === 'light';
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  };

  const loadTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    applyTheme(savedTheme);
  };

  // ----------------------
  // About Me Functions
  // ----------------------
  let editingAbout = false;

  const toggleEditing = () => {
    editingAbout = !editingAbout;
    aboutContent.contentEditable = editingAbout;
    editBtn.textContent = editingAbout ? 'Save' : 'Edit';

    if (editingAbout) {
      aboutContent.focus();
    } else {
      localStorage.setItem(STORAGE_KEYS.ABOUT, aboutContent.innerHTML);
    }
  };

  const loadAbout = () => {
    const savedAbout = localStorage.getItem(STORAGE_KEYS.ABOUT);
    if (savedAbout) aboutContent.innerHTML = savedAbout;
  };

  // ----------------------
  // Event Listeners
  // ----------------------
  toggleDark.addEventListener('change', () => {
    applyTheme(toggleDark.checked ? 'light' : 'dark');
  });

  editBtn.addEventListener('click', toggleEditing);

  // ----------------------
  // Init
  // ----------------------
  loadTheme();
  loadAbout();
});
