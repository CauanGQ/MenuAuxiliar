// script.js

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Checar o tema atual no armazenamento local
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    body.classList.remove('light', 'dark');
    body.classList.add(currentTheme);
}

// Alternar entre os temas ao clicar no botão
themeToggle.addEventListener('click', function() {
    if (body.classList.contains('light')) {
        body.classList.remove('light');
        body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark');
        body.classList.add('light');
        localStorage.setItem('theme', 'light');
    }
});
