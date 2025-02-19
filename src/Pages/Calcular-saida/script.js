// Alternar entre os modos de cálculo
const toggleModeBtn = document.getElementById('toggleMode');
const defaultModeFields = document.querySelectorAll('.default-mode');
const fullModeFields = document.querySelectorAll('.full-mode');

toggleModeBtn.addEventListener('click', function () {
    defaultModeFields.forEach(field => field.classList.toggle('hidden'));
    fullModeFields.forEach(field => field.classList.toggle('hidden'));

    if (toggleModeBtn.textContent === 'Modo Completo') {
        toggleModeBtn.textContent = 'Modo Padrão';
    } else {
        toggleModeBtn.textContent = 'Modo Completo';
    }
});

// Função para alternar o tema
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    body.classList.remove('light', 'dark');
    body.classList.add(currentTheme);
}

themeToggle.addEventListener('click', function () {
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

document.getElementById('calcForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const horaEntrada = document.getElementById('horaEntrada').value;
    const intervaloFeito = document.getElementById('intervalo').value;
    const horasExtras = document.getElementById('horasExtras').value;
    const saidaIntervalo = document.getElementById('saidaIntervalo').value;
    const retornoIntervalo = document.getElementById('retornoIntervalo').value;

    if (!horaEntrada || (!intervaloFeito && !saidaIntervalo && !retornoIntervalo)) {
        alert('Por favor, insira todos os dados corretamente.');
        return;
    }

    const [hora, minuto] = horaEntrada.split(':').map(Number);
    const minutosEntrada = hora * 60 + minuto;

    const tempoTrabalho = 7 * 60 + 20;

    let minutosIntervaloFeito = 0;

    if (saidaIntervalo && retornoIntervalo) {
        const [saidaHora, saidaMinuto] = saidaIntervalo.split(':').map(Number);
        const [retornoHora, retornoMinuto] = retornoIntervalo.split(':').map(Number);
        minutosIntervaloFeito = (retornoHora * 60 + retornoMinuto) - (saidaHora * 60 + saidaMinuto);
    } else {
        const [intervaloHoras, intervaloMinutos] = intervaloFeito.split(':').map(Number);
        minutosIntervaloFeito = intervaloHoras * 60 + intervaloMinutos;
    }

    if (minutosIntervaloFeito >= 2 * 60) {
        alert('Aviso: Seu intervalo ultrapassou 2 horas. Conversamos segunda no RH.');
    }

    const intervaloCorreto = Math.min(minutosIntervaloFeito, 1 * 60 + 59);

    let minutosExtras = 0;
    if (horasExtras) {
        const [extrasHoras, extrasMinutos] = horasExtras.split(':').map(Number);
        minutosExtras = extrasHoras * 60 + extrasMinutos;
        minutosExtras = Math.min(minutosExtras, 1 * 60 + 40);
    }

    let minutosSaida = minutosEntrada + tempoTrabalho + intervaloCorreto + minutosExtras;
    minutosSaida = minutosSaida % (24 * 60);

    const horaSaida = Math.floor(minutosSaida / 60);
    const minutoSaida = minutosSaida % 60;

    const resultado = `Seu horário de saída é ${horaSaida.toString().padStart(2, '0')}:${minutoSaida.toString().padStart(2, '0')}`;
    document.getElementById('result').textContent = resultado;
});
