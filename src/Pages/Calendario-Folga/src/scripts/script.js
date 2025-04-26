let dataAtual = new Date(); // Data atual
let sexoUsuario, folgaFixa, domingoInicial;
let layouts = {}; // Para armazenar layouts salvos

document.getElementById('gerar-calendario').addEventListener('click', function() {
    sexoUsuario = document.getElementById('sexo').value;
    folgaFixa = document.getElementById('folga-fixa').value;
    domingoInicial = new Date(document.getElementById('domingo-inicial').value); // Domingo inicial selecionado

    if (domingoInicial) {
        dataAtual = new Date(domingoInicial); // Definir o mês atual com base no domingo inicial
        gerarDiasCalendario();
        exibirMesAno();
        salvarDados(); // Salvar os dados no LocalStorage
    }
});

function gerarCalendario(mes, ano, folgaFixa) {
    const diasContainer = document.getElementById("dias");
    diasContainer.innerHTML = "";

    const primeiroDia = new Date(ano, mes).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    // Defina a lógica para alternar domingos (como exemplo)
    let domingoFolga = true; // Alterna entre domingo de folga ou não

    // Preenche os dias anteriores ao primeiro do mês
    for (let i = 0; i < primeiroDia; i++) {
        const emptySpan = document.createElement("span");
        emptySpan.classList.add("empty");
        diasContainer.appendChild(emptySpan);
    }

    // Preenche os dias do mês
    for (let dia = 1; dia <= ultimoDia; dia++) {
        const span = document.createElement("span");
        span.textContent = dia;

        const dataAtual = new Date(ano, mes, dia);

        // Marca os domingos e aplica alternância de folga
        if (dataAtual.getDay() === 0) {
            if (domingoFolga) {
                span.classList.add("domingo", "folga"); // Domingo de folga
            } else {
                span.classList.add("domingo"); // Domingo normal
            }
            domingoFolga = !domingoFolga; // Alterna entre folga ou não a cada domingo
        }

        // Marca a folga fixa na semana, por exemplo, nas segundas-feiras (day 1)
        if (dataAtual.getDay() === folgaFixa) {
            span.classList.add("folga");
        }

        diasContainer.appendChild(span);
    }
}



// Função para exibir o mês e ano no cabeçalho
function exibirMesAno() {
    const mesAnoSpan = document.getElementById('mes-ano');
    const opcoes = { month: 'long', year: 'numeric' };
    mesAnoSpan.textContent = dataAtual.toLocaleDateString('pt-BR', opcoes);
}

// Função para avançar ou voltar o mês
function mudarMes(inc) {
    dataAtual.setMonth(dataAtual.getMonth() + inc);
    gerarDiasCalendario();
    exibirMesAno();
}

// Botões de navegação
document.getElementById('prev-month').addEventListener('click', function() {
    mudarMes(-1);
});

document.getElementById('next-month').addEventListener('click', function() {
    mudarMes(1);
});

// Função para gerar os dias no calendário
function gerarDiasCalendario() {
    const diasDiv = document.getElementById('dias');
    diasDiv.innerHTML = ''; // Limpar o conteúdo anterior

    const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
    const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
    const diaDaSemana = primeiroDiaMes.getDay();
    
    // Criar espaços vazios até o primeiro dia do mês
    for (let i = 0; i < diaDaSemana; i++) {
        const espaco = document.createElement('div');
        espaco.classList.add('espaco-vazio');
        diasDiv.appendChild(espaco);
    }

    // Preencher os dias do mês
    for (let dia = 1; dia <= ultimoDiaMes.getDate(); dia++) {
        const diaDiv = document.createElement('div');
        diaDiv.classList.add('dia');
        diaDiv.textContent = dia;

        verificarFolga(diaDiv, dia);

        diasDiv.appendChild(diaDiv);
    }
}

// Função para verificar se o dia é folga
function verificarFolga(diaDiv, dia) {
    const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dia);
    const diaSemana = data.getDay();

    if (data >= domingoInicial) { // Considerar apenas dias a partir do domingo inicial
        // Definir folgas masculinas (2 domingos trabalhados e 1 de folga)
        if (sexoUsuario === 'homem' && diaSemana === 0) {
            const semanasDesdeInicio = Math.floor((data - domingoInicial) / (1000 * 60 * 60 * 24 * 7)); // Quantidade de semanas desde o domingo inicial
            if (semanasDesdeInicio % 3 === 0) { // Folga a cada terceiro domingo
                diaDiv.classList.add('folga');
            }
        }

        // Definir folgas femininas (domingo alternado)
        if (sexoUsuario === 'mulher' && diaSemana === 0) {
            const semanasDesdeInicio = Math.floor((data - domingoInicial) / (1000 * 60 * 60 * 24 * 7)); // Quantidade de semanas desde o domingo inicial
            if (semanasDesdeInicio % 2 === 0) { // Folga a cada domingo alternado
                diaDiv.classList.add('folga');
            }
        }
    }

    // Aplicar folga fixa semanal (segunda a sexta)
    if (diaSemana === obterNumeroDiaSemana(folgaFixa)) {
        diaDiv.classList.add('folga-fixa');
    }
}

// Função para obter o número do dia da semana a partir do nome
function obterNumeroDiaSemana(dia) {
    const dias = {
        'domingo': 0,
        'segunda': 1,
        'terca': 2,
        'quarta': 3,
        'quinta': 4,
        'sexta': 5
    };
    return dias[dia];
}

// Função para salvar os dados no LocalStorage
function salvarDados() {
    const dados = {
        sexo: sexoUsuario,
        folgaFixa: folgaFixa,
        domingoInicial: domingoInicial.toISOString()
    };
    localStorage.setItem('dadosFolga', JSON.stringify(dados));
}

// Função para carregar os dados salvos no LocalStorage
function carregarDados() {
    const dadosSalvos = localStorage.getItem('dadosFolga');
    if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        document.getElementById('sexo').value = dados.sexo;
        document.getElementById('folga-fixa').value = dados.folgaFixa;
        document.getElementById('domingo-inicial').value = dados.domingoInicial.split('T')[0];

        sexoUsuario = dados.sexo;
        folgaFixa = dados.folgaFixa;
        domingoInicial = new Date(dados.domingoInicial);
        dataAtual = new Date(domingoInicial); // Definir o mês atual como o de início
        gerarDiasCalendario();
        exibirMesAno();
    }
}

// Função para exportar os dados como arquivo JSON
document.getElementById('exportar-dados').addEventListener('click', function() {
    const dadosSalvos = localStorage.getItem('dadosFolga');
    if (dadosSalvos) {
        const blob = new Blob([dadosSalvos], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'dados-folga.json';
        link.click();
    }
});

// Função para carregar um arquivo JSON de dados
document.getElementById('carregar-dados').addEventListener('click', function() {
    const arquivo = document.getElementById('carregar-arquivo').files[0];
    if (arquivo) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const dados = JSON.parse(e.target.result);
            localStorage.setItem('dadosFolga', JSON.stringify(dados));
            carregarDados(); // Recarregar os dados após o upload
        };
        reader.readAsText(arquivo);
    }
});

// Função para salvar layouts
document.getElementById('salvar-layout').addEventListener('click', function() {
    const nomeLayout = document.getElementById('nome-layout').value;
    if (nomeLayout) {
        const dadosAtuais = {
            sexo: sexoUsuario,
            folgaFixa: folgaFixa,
            domingoInicial: domingoInicial.toISOString()
        };
        layouts[nomeLayout] = dadosAtuais;
        salvarLayoutsNoLocalStorage();
        atualizarOpcoesLayout();
    }
});

// Função para carregar layouts salvos
document.getElementById('carregar-layout').addEventListener('click', function() {
    const nomeLayout = document.getElementById('nome-layout').value;
    if (layouts[nomeLayout]) {
        const dados = layouts[nomeLayout];
        document.getElementById('sexo').value = dados.sexo;
        document.getElementById('folga-fixa').value = dados.folgaFixa;
        document.getElementById('domingo-inicial').value = dados.domingoInicial.split('T')[0];

        sexoUsuario = dados.sexo;
        folgaFixa = dados.folgaFixa;
        domingoInicial = new Date(dados.domingoInicial);
        dataAtual = new Date(domingoInicial);
        gerarDiasCalendario();
        exibirMesAno();
    }
});

// Função para salvar os layouts no LocalStorage
function salvarLayoutsNoLocalStorage() {
    localStorage.setItem('layouts', JSON.stringify(layouts));
}
// Função para carregar layouts do LocalStorage
function carregarLayoutsDoLocalStorage() {
    const layoutsSalvos = localStorage.getItem('layouts');
    if (layoutsSalvos) {
        layouts = JSON.parse(layoutsSalvos);
        atualizarOpcoesLayout();
    }
}

// Função para atualizar o menu de layouts com botões de excluir
function atualizarOpcoesLayout() {
    const listaLayouts = document.getElementById('lista-layouts-salvos');
    listaLayouts.innerHTML = ''; // Limpa a lista anterior

    for (const nomeLayout in layouts) {
        // Criar o contêiner do layout
        const layoutDiv = document.createElement('div');
        layoutDiv.classList.add('layout-item');
        
        // Criar o nome do layout
        const layoutNome = document.createElement('span');
        layoutNome.textContent = nomeLayout;
        
        // Criar o botão de excluir
        const excluirBtn = document.createElement('button');
        excluirBtn.innerHTML = '<img class="excluir-icon" src="/src/Pages/Calendario-Folga/src/imagens/excluir.png" alt="Excluir" />'; // Adicionar o ícone da lixeira (altere o caminho da imagem)
        excluirBtn.classList.add('excluir-layout');
        
        // Adicionar evento para excluir o layout
        excluirBtn.addEventListener('click', function() {
            excluirLayout(nomeLayout);
        });
        
        // Anexar o nome do layout e o botão de excluir ao contêiner
        layoutDiv.appendChild(layoutNome);
        layoutDiv.appendChild(excluirBtn);
        
        // Adicionar o contêiner ao menu
        listaLayouts.appendChild(layoutDiv);
    }
}

// Função para excluir um layout
function excluirLayout(nomeLayout) {
    delete layouts[nomeLayout]; // Remove o layout do objeto
    salvarLayoutsNoLocalStorage(); // Atualiza o LocalStorage
    atualizarOpcoesLayout(); // Atualiza a lista exibida
}


// Alternar tema
document.getElementById('theme-toggle').addEventListener('click', function() {
    const body = document.body;
    body.classList.toggle('dark');
    body.classList.toggle('light');
});

// Chamar carregarLayoutsDoLocalStorage ao iniciar a página
carregarLayoutsDoLocalStorage();