/* =========================================================
   UPLOAD DE FOTOS
========================================================= */

const photoInput = document.getElementById("photoInput");

const preview = document.getElementById("preview");
const previewImage = document.getElementById("previewImage");

const uploadMessage = document.getElementById("uploadMessage");

const gallery = document.getElementById("gallery");

const minion = document.getElementById("minion");


/* =========================================================
   QUANDO ESCOLHER UMA FOTO
========================================================= */

photoInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }


    /* -----------------------------------------------------
       Verifica se é uma imagem
    ----------------------------------------------------- */

    if (!file.type.startsWith("image/")) {

        alert("Escolha uma imagem válida.");

        this.value = "";

        return;
    }


    /* -----------------------------------------------------
       Cria endereço temporário para a imagem
    ----------------------------------------------------- */

    const imageURL = URL.createObjectURL(file);


    /* -----------------------------------------------------
       Mostra a prévia
    ----------------------------------------------------- */

    previewImage.src = imageURL;

    preview.style.display = "block";


    /* -----------------------------------------------------
       Mostra mensagem
    ----------------------------------------------------- */

    uploadMessage.style.display = "block";


    /* -----------------------------------------------------
       Faz o Minion dançar
    ----------------------------------------------------- */

    minion.classList.remove("dancing");

    void minion.offsetWidth;

    minion.classList.add("dancing");


    /* -----------------------------------------------------
       Adiciona a foto à galeria
    ----------------------------------------------------- */

    adicionarFotoNaGaleria(imageURL);


    /* -----------------------------------------------------
       Para a dança depois de alguns segundos
    ----------------------------------------------------- */

    setTimeout(function () {

        minion.classList.remove("dancing");

    }, 4000);


    /* -----------------------------------------------------
       Limpa o input para permitir selecionar
       a mesma foto novamente
    ----------------------------------------------------- */

    this.value = "";

});


/* =========================================================
   ADICIONAR FOTO À GALERIA
========================================================= */

function adicionarFotoNaGaleria(imageURL) {

    const card = document.createElement("div");

    card.className = "photo-card";


    /* -----------------------------------------------------
       Imagem
    ----------------------------------------------------- */

    const img = document.createElement("img");

    img.src = imageURL;

    img.alt = "Fotinha";


    /* -----------------------------------------------------
       Data
    ----------------------------------------------------- */

    const date = document.createElement("div");

    date.className = "photo-date";

    date.textContent = obterDataAtual();


    /* -----------------------------------------------------
       Monta o card
    ----------------------------------------------------- */

    card.appendChild(img);

    card.appendChild(date);


    /* -----------------------------------------------------
       Coloca a foto NO COMEÇO da galeria
    ----------------------------------------------------- */

    gallery.prepend(card);

}


/* =========================================================
   DATA ATUAL
========================================================= */

function obterDataAtual() {

    const agora = new Date();

    const dia =
        String(agora.getDate())
        .padStart(2, "0");

    const mes =
        String(agora.getMonth() + 1)
        .padStart(2, "0");

    const ano =
        agora.getFullYear();

    return `${dia}/${mes}/${ano}`;
}