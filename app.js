// ---------------------------------------------------
// MIGRAÇÃO: apagar dados antigos APENAS UMA VEZ
// ---------------------------------------------------
if (!localStorage.getItem("pesquisa_migrada")) {
  localStorage.clear(); // limpa tudo UMA vez
  localStorage.setItem("id", 0); // zera contador
  localStorage.setItem("pesquisa_migrada", "ok"); // marca que já migrou
}

// ---------------------------------------------------
// MODELO DA PESQUISA
// ---------------------------------------------------
class Pesquisa {
  constructor(
    data_visita,
    qtd_pessoas,
    nota_geral,
    nota_refeicao,
    nota_atendimento,
    nota_ambiente,
    nota_tempo,
    nota_preco,
    comentario,
    nome_cliente,
    nome_garcom
  ) {
    this.data_visita = data_visita;
    this.qtd_pessoas = qtd_pessoas;
    this.nota_geral = nota_geral;
    this.nota_refeicao = nota_refeicao;
    this.nota_atendimento = nota_atendimento;
    this.nota_ambiente = nota_ambiente;
    this.nota_tempo = nota_tempo;
    this.nota_preco = nota_preco;
    this.comentario = comentario;
    this.nome_cliente = nome_cliente || "";
    this.nome_garcom = nome_garcom || "";
  }

  // obrigatórios: data e nota geral
  validar() {
    return this.data_visita !== "" && this.nota_geral !== "";
  }
}

// ---------------------------------------------------
// BANCO DE DADOS
// ---------------------------------------------------
class Bd {
  constructor() {
    if (localStorage.getItem("id") === null) {
      localStorage.setItem("id", 0);
    }
  }

  getProximoId() {
    let id = localStorage.getItem("id");
    return parseInt(id) + 1;
  }

  gravar(p) {
    let id = this.getProximoId();
    localStorage.setItem(id, JSON.stringify(p));
    localStorage.setItem("id", id);
  }

  recuperar() {
    let pesquisas = [];
    let maxId = localStorage.getItem("id");

    for (let i = 1; i <= maxId; i++) {
      let p = JSON.parse(localStorage.getItem(i));
      if (p === null) continue;

      p.id = i;
      pesquisas.push(p);
    }

    return pesquisas;
  }

  filtrar(filtro) {
    let lista = this.recuperar();

    if (filtro.dia || filtro.mes || filtro.ano) {
      const diaFiltro = filtro.dia ? filtro.dia.padStart(2, "0") : "";
      const mesFiltro = filtro.mes ? filtro.mes.padStart(2, "0") : "";
      const anoFiltro = filtro.ano || "";

      lista = lista.filter((p) => {
        const partes = (p.data_visita || "").split("/");
        const dia = partes[0] || "";
        const mes = partes[1] || "";
        const ano = partes[2] || "";

        if (diaFiltro && dia !== diaFiltro) return false;
        if (mesFiltro && mes !== mesFiltro) return false;
        if (anoFiltro && ano !== anoFiltro) return false;

        return true;
      });
    }

    if (filtro.nota_geral !== "")
      lista = lista.filter((p) => p.nota_geral === filtro.nota_geral);

    return lista;
  }

  remover(id) {
    localStorage.removeItem(id);
  }
}

let bd = new Bd();

// ---------------------------------------------------
// FORMATADOR DE NOTAS
// ---------------------------------------------------
function formatarNota(valor) {
  if (!valor) return "-";

  const n = parseInt(valor, 10);
  let classe = "nota-med";

  if (n <= 2) classe = "nota-ruim";
  else if (n === 3) classe = "nota-med";
  else classe = "nota-boa";

  return `<span class="nota ${classe}">${n}</span>`;
}

// ---------------------------------------------------
// CADASTRAR PESQUISA
// ---------------------------------------------------
function cadastrarDespesa() {
  const nome_cliente =
    document.getElementById("nome_cliente")?.value.trim() || "";
  const nome_garcom =
    document.getElementById("nome_garcom")?.value.trim() || "";

  const diaInput = document.getElementById("dia_visita").value.trim();
  const mesInput = document.getElementById("mes_visita").value.trim();
  const anoInput = document.getElementById("ano_visita").value.trim();

  let data_visita = "";
  if (diaInput && mesInput && anoInput) {
    const dia = diaInput.padStart(2, "0");
    const mes = mesInput.padStart(2, "0");
    data_visita = `${dia}/${mes}/${anoInput}`;
  }

  let notaGeralSelecionada = document.querySelector(
    "input[name='nota_geral']:checked"
  );
  let notaGeral = notaGeralSelecionada ? notaGeralSelecionada.value : "";

  let pesquisa = new Pesquisa(
    data_visita,
    document.getElementById("qtd_pessoas").value,
    notaGeral,
    document.getElementById("nota_refeicao").value,
    document.getElementById("nota_atendimento").value,
    document.getElementById("nota_ambiente").value,
    document.getElementById("nota_tempo").value,
    document.getElementById("nota_preco").value,
    document.getElementById("comentario").value,
    nome_cliente,
    nome_garcom
  );

  if (pesquisa.validar()) {
    bd.gravar(pesquisa);

    document.getElementById("modal_titulo").innerHTML =
      "Pesquisa registrada com sucesso!";
    document.getElementById("modal_titulo_div").className =
      "modal-header text-success";
    document.getElementById("modal_conteudo").innerHTML =
      "Obrigado por responder nossa pesquisa!";
    document.getElementById("modal_btn").innerHTML = "Fechar";
    document.getElementById("modal_btn").className = "btn btn-success";
    $("#modalRegistraDespesa").modal("show");

    // limpar campos (inputs, selects, textarea)
    document.querySelectorAll("input, textarea, select").forEach((el) => {
      if (el.type === "radio") el.checked = false;
      else el.value = "";
    });
  } else {
    document.getElementById("modal_titulo").innerHTML = "Erro ao registrar";
    document.getElementById("modal_titulo_div").className =
      "modal-header text-danger";
    document.getElementById("modal_conteudo").innerHTML =
      "Por favor, preencha a data e a satisfação geral.";
    document.getElementById("modal_btn").innerHTML = "Voltar";
    document.getElementById("modal_btn").className = "btn btn-danger";
    $("#modalRegistraDespesa").modal("show");
  }
}

// ---------------------------------------------------
// LISTAR PESQUISAS NA TABELA
// ---------------------------------------------------
function carregaListaDespesas(lista = [], filtro = false) {
  if (!filtro) lista = bd.recuperar();

  let tabela = document.getElementById("listaDespesas");
  if (!tabela) return;

  tabela.innerHTML = "";

  lista.forEach((p) => {
    let linha = tabela.insertRow();

    // Data | Cliente | Nota geral | Refeição | Atendimento | Ambiente | Tempo | Preço | Comentário | Ações
    linha.insertCell(0).innerHTML = p.data_visita || "-";
    linha.insertCell(1).innerHTML = p.nome_cliente || "-";
    linha.insertCell(2).innerHTML = formatarNota(p.nota_geral);
    linha.insertCell(3).innerHTML = formatarNota(p.nota_refeicao);

    const celAtendimento = linha.insertCell(4);
    celAtendimento.innerHTML = formatarNota(p.nota_atendimento);
    if (p.nome_garcom) {
      celAtendimento.innerHTML += `<br><small>${p.nome_garcom}</small>`;
    }

    linha.insertCell(5).innerHTML = formatarNota(p.nota_ambiente);
    linha.insertCell(6).innerHTML = formatarNota(p.nota_tempo);
    linha.insertCell(7).innerHTML = formatarNota(p.nota_preco);
    linha.insertCell(8).innerHTML = p.comentario || "";

    let btn = document.createElement("button");
    btn.className = "btn btn-danger btn-sm";
    btn.innerHTML = '<i class="fa fa-times"></i>';
    btn.onclick = () => {
      if (confirm("Deseja realmente excluir esta pesquisa?")) {
        bd.remover(p.id);
        window.location.reload();
      }
    };

    linha.insertCell(9).append(btn);
  });
}

// ---------------------------------------------------
// FILTRAR PESQUISAS
// ---------------------------------------------------
function pesquisarDespesa() {
  let filtro = {
    dia: document.getElementById("dia_visita_filtro")?.value || "",
    mes: document.getElementById("mes_visita_filtro")?.value || "",
    ano: document.getElementById("ano_visita_filtro")?.value || "",
    nota_geral: document.getElementById("nota_filtro")?.value || "",
  };

  let lista = bd.filtrar(filtro);
  carregaListaDespesas(lista, true);
}

// ---------------------------------------------------
// EXPORTAR CSV (UTF-8 + BOM)
// ---------------------------------------------------
function exportarCSV() {
  const lista = bd.recuperar();

  if (lista.length === 0) {
    alert("Não há pesquisas para exportar.");
    return;
  }

  const sep = ";";
  let csv =
    "Data;Cliente;Nota Geral;Refeição;Atendimento;Garçom;Ambiente;Tempo;Preço;Comentário\n";

  lista.forEach((p) => {
    const esc = (valor) =>
      `${valor ?? ""}`.replace(/\r?\n/g, " ").replace(/"/g, '""');

    const linha = [
      esc(p.data_visita),
      esc(p.nome_cliente),
      esc(p.nota_geral),
      esc(p.nota_refeicao),
      esc(p.nota_atendimento),
      esc(p.nome_garcom),
      esc(p.nota_ambiente),
      esc(p.nota_tempo),
      esc(p.nota_preco),
      esc(p.comentario),
    ]
      .map((v) => `"${v}"`)
      .join(sep);

    csv += linha + "\n";
  });

  const BOM = "\uFEFF";

  const blob = new Blob([BOM + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const nomeArquivo = `pesquisas_${new Date().toISOString().slice(0, 10)}.csv`;

  link.href = url;
  link.download = nomeArquivo;
  link.click();

  URL.revokeObjectURL(url);
}

// ---------------------------------------------------
// LOGOUT
// ---------------------------------------------------
function logout() {
  localStorage.removeItem("auth_sinatra");
  window.location.href = "login.html";
}
