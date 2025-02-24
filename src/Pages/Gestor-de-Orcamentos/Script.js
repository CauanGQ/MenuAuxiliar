document.addEventListener("DOMContentLoaded", function () {
  const abrirPopupBtn = document.getElementById("abrir-popup");
  const fecharPopupBtn = document.getElementById("fechar-popup");
  const adicionarItemBtn = document.getElementById("adicionar-item");
  const salvarOrcamentoBtn = document.getElementById("salvar-orcamento");
  const carregarOrcamentoInput = document.getElementById("carregar-orcamento");
  const popup = document.getElementById("popup");
  const overlay = document.getElementById("popup-overlay");
  const listaItens = document.getElementById("lista-itens");
  const descricaoInput = document.getElementById("item-descricao");
  const precoInput = document.getElementById("item-preco");
  const pagamentoInput = document.getElementById("item-pagamento");
  const parcelasContainer = document.getElementById("parcelas-container");
  const parcelasInput = document.getElementById("item-parcelas");
  const vencimentoInput = document.getElementById("item-vencimento");
  const repetirContainer = document.getElementById("item-repetir-container"); // Container para o campo de repetição

  let orcamento = []; // Assumindo que este array armazena os itens do orçamento
  let itemEditando = null;

  pagamentoInput.addEventListener("change", function () {
  if (pagamentoInput.value === "parcelado") {
    parcelasContainer.style.display = "block";
    document.getElementById("repetir-container").style.display = "none"; // Oculta repetição ao parcelar
  } else if (pagamentoInput.value === "repetir") {
    parcelasContainer.style.display = "none"; // Oculta parcelas ao repetir
    document.getElementById("repetir-container").style.display = "block"; // Mostra repetição ao repetir
  } else {
    parcelasContainer.style.display = "none";
    document.getElementById("repetir-container").style.display = "none"; // Oculta ambos se não for parcelado nem repetir
  }
});


  function abrirPopup() {
    popup.style.display = 'block';
    overlay.style.display = 'block';
    itemEditando = null;
  }

  function fecharPopup() {
    popup.style.display = 'none';
    overlay.style.display = 'none';
    limparCampos();
  }

  function limparCampos() {
  descricaoInput.value = '';
  precoInput.value = '';
  pagamentoInput.value = "padraoOp";
  parcelasContainer.style.display = "none";
  document.getElementById("repetir-container").style.display = "none"; // Oculta o campo de repetição
  parcelasInput.value = 1;
  vencimentoInput.value = '';
  document.getElementById("item-repetir").value = 0; // Reseta valor de repetição
  document.getElementById("item-repetir-sempre").checked = false; // Reseta checkbox de repetir sempre
}

  function adicionarItem() {
    const descricao = descricaoInput.value.trim();
    const preco = parseFloat(precoInput.value);
    const pagamento = pagamentoInput.value;
    const parcelas = parseInt(parcelasInput.value);
    const vencimento = vencimentoInput.value ? new Date(vencimentoInput.value) : new Date();
    const repetirContas = parseInt(document.getElementById("item-repetir").value); // Valor de repetição
    const repetirIndefinido = document.getElementById("item-repetir-sempre").checked; // Checa repetição indefinida

    if (descricao === "" || isNaN(preco) || preco <= 0) {
      alert("Por favor, preencha a descrição e o preço corretamente.");
      return;
    }

    if (pagamento === "parcelado" && (isNaN(parcelas) || parcelas <= 0)) {
      alert("Por favor, insira um número válido de parcelas.");
      return;
    }

    let total = preco;

    if (pagamento === "parcelado" && parcelas > 1) {
      total = preco / parcelas;
    }

    const item = {
      descricao,
      preco,
      total,
      pagamento,
      parcelas,
      pago: false,
      vencimento,
      parcelasPagas: 0,
      parcelasDetalhadas: [],
      repetir: pagamento === "repetir" ? repetirContas : 0, // Armazena o número de repetições
      repetirIndefinido: pagamento === "repetir" ? repetirIndefinido : false, // Armazena se é indefinido
    };

    orcamento.push(item);
    atualizarListaItens();
    fecharPopup();
  }

  function editarItem(index) {
    const item = orcamento[index];
    descricaoInput.value = item.descricao;
    precoInput.value = item.preco;
    pagamentoInput.value = item.pagamento;
    parcelasInput.value = item.parcelas;
    vencimentoInput.value = item.vencimento.toISOString().split('T')[0];

    if (item.pagamento === "parcelado") {
      parcelasContainer.style.display = "block";
    }

    itemEditando = index;
    abrirPopup();
  }

  function excluirItem(index) {
    orcamento.splice(index, 1);  // Remove o item do array
    atualizarListaItens();  // Atualiza a lista
  }

  function marcarComoPago(index) {
    const item = orcamento[index];

    if (item.parcelasPagas < item.parcelas) {
        item.parcelasPagas++;
        item.parcelasDetalhadas.push({
            numero: item.parcelasPagas,
            vencimento: new Date(item.vencimento),
            pago: true
        });

        // Atualiza o vencimento para o próximo mês
        item.vencimento.setMonth(item.vencimento.getMonth() + 1);
    }

    if (item.parcelasPagas === item.parcelas) {
        item.pago = true; // Marca como completamente pago se todas as parcelas foram pagas

        // Se o item tem repetições configuradas, adiciona a próxima repetição
        if (item.repetir > 0) {
            item.repetir--; // Decrementa o número de repetições restantes
            const novoItem = { ...item }; // Copia o item original
            novoItem.parcelasPagas = 0; // Reseta o número de parcelas pagas
            novoItem.pago = false; // Marca o novo item como não pago
            orcamento.push(novoItem); // Adiciona o novo item à lista de orçamento
        } else if (item.repetirIndefinido) {
            const novoItem = { ...item };
            novoItem.parcelasPagas = 0;
            novoItem.pago = false;
            orcamento.push(novoItem);
        }
    }

    atualizarListaItens();
}

  function desmarcarUltimaParcela(index) {
    const item = orcamento[index];

    if (item.parcelasPagas > 0) {
      item.parcelasPagas--;
      item.parcelasDetalhadas.pop();  // Remove a última parcela paga

      // Atualiza o vencimento para o mês anterior
      item.vencimento.setMonth(item.vencimento.getMonth() - 1);
    }

    if (item.parcelasPagas < item.parcelas) {
      item.pago = false;  // Remove o status de completamente pago
    }

    atualizarListaItens();
  }

  function atualizarListaItens() {
    listaItens.innerHTML = '';  // Limpa a lista de itens exibidos
    const meses = {};

    orcamento.forEach((item, index) => {
        const mes = item.vencimento.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!meses[mes]) {
            meses[mes] = [];
        }
        meses[mes].push({ item, index });
    });

    const ordemMeses = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const mesesOrdenados = Object.keys(meses).sort((a, b) => {
        const [mesA, anoA] = a.split(' ');
        const [mesB, anoB] = b.split(' ');

        const anoAInt = parseInt(anoA);
        const anoBInt = parseInt(anoB);

        // Se os anos forem diferentes, prioriza o ano mais recente
        if (anoBInt !== anoAInt) {
            return anoBInt - anoAInt;
        }

        // Caso o ano seja o mesmo, ordena os meses de acordo com a ordem especificada
        const indiceMesA = ordemMeses.indexOf(new Date(`${mesA} 1`).toLocaleString('en-US', { month: 'long' }));
        const indiceMesB = ordemMeses.indexOf(new Date(`${mesB} 1`).toLocaleString('en-US', { month: 'long' }));
        return indiceMesA - indiceMesB;
    });

    mesesOrdenados.forEach(mes => {
        const categoriaMes = document.createElement("div");
        const tituloMes = document.createElement("h3");
        tituloMes.textContent = mes;
        categoriaMes.appendChild(tituloMes);

        meses[mes].forEach(({ item, index }) => {
            const novoItem = document.createElement("li");
            novoItem.innerHTML = `
              <p style="margin-bottom: 10px;">
                <strong>${item.descricao} - R$ ${item.preco.toFixed(2)} (${item.pagamento === "parcelado" ? item.parcelas + " parcelas" : "À vista"})</strong><br>
                <span>Total: R$ ${item.total.toFixed(2)}</span><br>
                <span>Vencimento: ${item.vencimento.toLocaleDateString()}</span>
              </p>
              <div style="background-color: ${item.pago ? '#00FF00' : '#FF0000'}; color: #fff; padding: 5px; border-radius: 5px">
                <span>${item.pago ? "Paga" : "Não Paga"} (${item.parcelasPagas}/${item.parcelas})</span>
              </div>
              <button class="editar">Editar</button>
              <button class="excluir">Excluir</button>
              <button class="pagar" style="display: ${item.parcelasPagas < item.parcelas ? 'block' : 'none'};">Marcar como Pago</button>
              <button class="desmarcar" style="display: ${item.parcelasPagas > 0 ? 'block' : 'none'};">Desmarcar Última Parcela</button>
              <div>
                ${item.parcelasDetalhadas.map(parcela => 
                  `<p>Parcela ${parcela.numero} - Vencimento: ${parcela.vencimento.toLocaleDateString()} - ${parcela.pago ? "Pago" : "Não Pago"}</p>`
                ).join('')}
              </div>
            `;

            const editarBtn = novoItem.querySelector(".editar");
            editarBtn.addEventListener("click", () => editarItem(index));

            const excluirBtn = novoItem.querySelector(".excluir");
            excluirBtn.addEventListener("click", () => excluirItem(index));

            const pagarBtn = novoItem.querySelector(".pagar");
            pagarBtn.addEventListener("click", () => marcarComoPago(index));

            const desmarcarBtn = novoItem.querySelector(".desmarcar");
            desmarcarBtn.addEventListener("click", () => desmarcarUltimaParcela(index));

            categoriaMes.appendChild(novoItem);
        });

        listaItens.appendChild(categoriaMes);
    });
}


  // Função para salvar o orçamento
function salvarOrcamento() {
    const orcamentoJSON = JSON.stringify(orcamento, null, 2); // Transforma o orçamento em JSON
    const blob = new Blob([orcamentoJSON], { type: "application/json" }); // Cria um Blob com o JSON
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "orcamento.json"; // Define o nome do arquivo
    link.click(); // Baixa o arquivo
}


  // Função para carregar arquivo
  carregarOrcamentoInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      // Converte as strings de data para objetos Date
      data.forEach(item => {
        item.vencimento = new Date(item.vencimento);
      });

      orcamento = data;
      atualizarListaItens();
    } catch (error) {
      alert("Erro ao carregar o arquivo: " + erro.message);
    }
  };
  reader.readAsText(file);
});


   // Função para salvar o orçamento como arquivo JSON
   function salvarOrcamento() {
    const dataStr = JSON.stringify(orcamento, null, 2); // Converte o orçamento para JSON formatado
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'orcamento.json'; // Nome do arquivo que será baixado
    a.click();

    URL.revokeObjectURL(url); // Libera a URL
  }


  salvarOrcamentoBtn.addEventListener("click", salvarOrcamento);
  abrirPopupBtn.addEventListener("click", abrirPopup);
  fecharPopupBtn.addEventListener("click", fecharPopup);
  adicionarItemBtn.addEventListener("click", adicionarItem);
  
});
