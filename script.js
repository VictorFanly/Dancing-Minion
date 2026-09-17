/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL = "https://xkklazdxlsorbdoubjym.supabase.co";

const SUPABASE_KEY = "sb_publishable_D_SYNnt5zjULrQVPwmYdeQ_Pj2M98GW";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

/* =========================================================
   ELEMENTOS DA PÁGINA
========================================================= */

const photoCount = document.getElementById("photoCount");

const photoInput =
    document.getElementById("photoInput");

const preview =
    document.getElementById("preview");

const previewImage =
    document.getElementById("previewImage");

const uploadMessage =
    document.getElementById("uploadMessage");

const gallery =
    document.getElementById("gallery");

const minion =
    document.getElementById("minion");

const profileInput = document.getElementById("profileInput");

const profilePicture = document.getElementById("profilePicture");
/* =========================================================
   VISUALIZADOR
========================================================= */

const photoViewer =
    document.getElementById("photoViewer");

const viewerImage =
    document.getElementById("viewerImage");

const viewerDate =
    document.getElementById("viewerDate");

const closePhotoViewer =
    document.getElementById("closePhotoViewer");

const viewerBack =
    document.getElementById("viewerBack");

/* =========================================================
   UPLOAD
========================================================= */

photoInput.addEventListener("change", async function () {

    const file = this.files[0];

    if (!file) {
        return;
    }


    /* -----------------------------------------------------
       Verifica se é imagem
    ----------------------------------------------------- */

    if (!file.type.startsWith("image/")) {

        alert("Escolha uma imagem válida.");

        this.value = "";

        return;
    }


    /* -----------------------------------------------------
       Verifica tamanho
    ----------------------------------------------------- */

    const tamanhoMaximo =
        10 * 1024 * 1024;

    if (file.size > tamanhoMaximo) {

        alert("A foto pode ter no máximo 10 MB.");

        this.value = "";

        return;
    }


    /* -----------------------------------------------------
       Mostra prévia imediatamente
    ----------------------------------------------------- */

    const imageURL =
        URL.createObjectURL(file);

    previewImage.src = imageURL;

    preview.style.display = "block";


    /* -----------------------------------------------------
       Mensagem de carregamento
    ----------------------------------------------------- */

    uploadMessage.style.display = "block";

    uploadMessage.textContent =
        "⏳ ENVIANDO SUA FOTINHA...";


    /* -----------------------------------------------------
       Nome único para o arquivo
    ----------------------------------------------------- */

    const extensao =
        file.name.split(".").pop();

    const nomeArquivo =
        `${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 8)}.${extensao}`;


    /* -----------------------------------------------------
       Caminho dentro do Storage
    ----------------------------------------------------- */

    const caminhoArquivo =
        `fotos/${nomeArquivo}`;


    try {

        /* =================================================
           1. ENVIA PARA O STORAGE
        ================================================= */

        const { error: storageError } =
            await supabaseClient
                .storage
                .from("photos")
                .upload(
                    caminhoArquivo,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false
                    }
                );


        if (storageError) {

            throw storageError;

        }


        /* =================================================
           2. PEGA A URL PÚBLICA
        ================================================= */

        const { data: publicData } =
            supabaseClient
                .storage
                .from("photos")
                .getPublicUrl(
                    caminhoArquivo
                );


        const publicURL =
            publicData.publicUrl;


        /* =================================================
           3. SALVA NA TABELA
        ================================================= */

        const { error: databaseError } =
            await supabaseClient
                .from("fotos")
                .insert({

                    nome_arquivo:
                        file.name,

                    url:
                        publicURL

                });


        if (databaseError) {

            throw databaseError;

        }


        /* =================================================
           4. ADICIONA NA GALERIA
        ================================================= */

        adicionarFotoNaGaleria(
            publicURL
        );

        atualizarContadorFotos();


        /* =================================================
           5. MENSAGEM DE SUCESSO
        ================================================= */

        uploadMessage.textContent =
            "✨ FOTO ENVIADA!!! O MINION ESTÁ DANÇANDO!!! ✨";


        /* =================================================
           6. DANÇA
        ================================================= */

        minion.classList.remove("dancing");

        void minion.offsetWidth;

        minion.classList.add("dancing");


        setTimeout(function () {

            minion.classList.remove("dancing");

        }, 4000);


    } catch (error) {

        console.error(
            "Erro ao enviar foto:",
            error
        );


        uploadMessage.textContent =
            "❌ Ocorreu um erro ao enviar a foto.";

        uploadMessage.style.display =
            "block";

    }


    /* -----------------------------------------------------
       Permite selecionar a mesma foto novamente
    ----------------------------------------------------- */

    this.value = "";

});

async function atualizarFotoPerfil(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Escolha uma imagem válida.");
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert("A foto precisa ter no máximo 10 MB.");
        return;
    }

    try {
        profilePicture.innerHTML = "⏳";

        const caminhoPerfil = "profile/profile.jpg";

        // Atualiza o arquivo que já existe
        const { error: updateError } =
            await supabaseClient.storage
                .from("photos")
                .update(caminhoPerfil, file, {
                    cacheControl: "3600"
                });

        if (updateError) {
            throw updateError;
        }

        const { data } =
            supabaseClient.storage
                .from("photos")
                .getPublicUrl(caminhoPerfil);

        // Evita o cache do navegador
        const publicURL = `${data.publicUrl}?v=${Date.now()}`;

        profilePicture.innerHTML = "";

        const imagem = document.createElement("img");
        imagem.src = publicURL;
        imagem.alt = "Foto de perfil";

        profilePicture.appendChild(imagem);

    } catch (error) {
        console.error("Erro ao atualizar foto de perfil:", error);

        // Tenta manter a foto que já estava sendo exibida
        carregarFotoPerfil();

        alert("Não foi possível atualizar a foto de perfil.");
    }
}

/* =========================================================
   ATUALIZAR CONTADOR
========================================================= */

function atualizarContadorFotos() {

    const quantidade =
        gallery.querySelectorAll(".photo-card").length;

    photoCount.textContent =
        `${quantidade} FOTINHA${quantidade === 1 ? "" : "S"}`;
}

/* =========================================================
   ADICIONAR FOTO À GALERIA
========================================================= */

function adicionarFotoNaGaleria(imageURL) {

    const card =
        document.createElement("div");

    card.className =
        "photo-card";


    const img =
        document.createElement("img");

    img.src =
        imageURL;

    img.alt =
        "Fotinha";


    const date =
        document.createElement("div");

    date.className =
        "photo-date";

    date.textContent =
        obterDataAtual();


    const deleteButton =
        document.createElement("div");

    deleteButton.className =
        "photo-delete";

    deleteButton.textContent =
        "excluir";


    card.appendChild(img);

    card.appendChild(date);

    card.appendChild(deleteButton);


    /* -----------------------------------------------------
       Abrir foto
    ----------------------------------------------------- */

    img.addEventListener(
        "click",
        function () {

            abrirVisualizador(
                imageURL,
                obterDataAtual()
            );

        }
    );


    /* -----------------------------------------------------
       Excluir
    ----------------------------------------------------- */

    deleteButton.addEventListener(
        "click",
        async function (event) {

            event.stopPropagation();

            await excluirFoto(
                imageURL,
                card
            );

        }
    );


    gallery.prepend(card);

}


/* =========================================================
   DATA ATUAL
========================================================= */

function obterDataAtual() {

    const agora =
        new Date();

    const dia =
        String(
            agora.getDate()
        ).padStart(2, "0");

    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(2, "0");

    const ano =
        agora.getFullYear();

    return `${dia}/${mes}/${ano}`;
}

/* =========================================================
   CARREGAR FOTOS SALVAS
========================================================= */

async function carregarFotos() {

    try {

        const { data, error } =
            await supabaseClient
                .from("fotos")
                .select("*")
                .order(
                    "data_upload",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        // Limpa a galeria antes de carregar
        gallery.innerHTML = "";

        // Adiciona as fotos salvas
        if (data && data.length > 0) {

            data.forEach(function (foto) {

                adicionarFotoSalva(
                    foto.url,
                    foto.data_upload
                );

            });

        }

        // Atualiza o contador SOMENTE depois de carregar tudo
        atualizarContadorFotos();

    } catch (error) {

        console.error(
            "Erro ao carregar fotos:",
            error
        );

        // Mesmo se não houver fotos ou ocorrer erro,
        // mantém o contador sincronizado
        atualizarContadorFotos();
    }
}


/* =========================================================
   ADICIONAR FOTO SALVA
========================================================= */

function adicionarFotoSalva(
    imageURL,
    dataUpload
) {

    const card =
        document.createElement("div");

    card.className =
        "photo-card";


    const img =
        document.createElement("img");

    img.src =
        imageURL;

    img.alt =
        "Fotinha";


    const date =
        document.createElement("div");

    date.className =
        "photo-date";

    date.textContent =
        formatarData(
            dataUpload
        );


    const deleteButton =
        document.createElement("div");

    deleteButton.className =
        "photo-delete";

    deleteButton.textContent =
        "excluir";


    card.appendChild(img);

    card.appendChild(date);

    card.appendChild(deleteButton);


    /* -----------------------------------------------------
       Abrir foto
    ----------------------------------------------------- */

    img.addEventListener(
        "click",
        function () {

            abrirVisualizador(
                imageURL,
                formatarData(dataUpload)
            );

        }
    );


    /* -----------------------------------------------------
       Excluir
    ----------------------------------------------------- */

    deleteButton.addEventListener(
        "click",
        async function (event) {

            event.stopPropagation();

            await excluirFoto(
                imageURL,
                card
            );

        }
    );


    gallery.appendChild(card);

}


/* =========================================================
   FORMATAR DATA DO SUPABASE
========================================================= */

function formatarData(
    dataString
) {

    const data =
        new Date(
            dataString
        );

    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");

    const ano =
        data.getFullYear();

    return `${dia}/${mes}/${ano}`;

}


/* =========================================================
   CARREGA AS FOTOS AO ABRIR A PÁGINA
========================================================= */

carregarFotos();

/* =========================================================
   ABRIR VISUALIZADOR
========================================================= */

let fotoAtual = 0;

let listaFotos = [];


/* =========================================================
   ATUALIZAR LISTA DE FOTOS
========================================================= */

function atualizarListaFotos() {

    const cards =
        gallery.querySelectorAll(".photo-card");

    listaFotos = [];

    cards.forEach(function (card) {

        const imagem =
            card.querySelector("img");

        const data =
            card.querySelector(".photo-date");

        if (!imagem) {
            return;
        }

        listaFotos.push({
            url: imagem.src,
            data: data
                ? data.textContent
                : ""
        });

    });
}


/* =========================================================
   CRIAR BOTÕES DE NAVEGAÇÃO
========================================================= */

const viewerNavigation =
    document.createElement("div");

viewerNavigation.className =
    "viewer-navigation";


const viewerPrevious =
    document.createElement("button");

viewerPrevious.className =
    "viewer-nav-button viewer-previous";

viewerPrevious.textContent =
    "‹";


const viewerNext =
    document.createElement("button");

viewerNext.className =
    "viewer-nav-button viewer-next";

viewerNext.textContent =
    "›";


const viewerPosition =
    document.createElement("div");

viewerPosition.className =
    "viewer-position";


viewerNavigation.appendChild(
    viewerPrevious
);

viewerNavigation.appendChild(
    viewerPosition
);

viewerNavigation.appendChild(
    viewerNext
);

photoViewer.appendChild(
    viewerNavigation
);


/* =========================================================
   MOSTRAR FOTO ATUAL
========================================================= */

function mostrarFotoAtual() {

    if (
        listaFotos.length === 0
    ) {
        return;
    }

    const foto =
        listaFotos[fotoAtual];

    viewerImage.src =
        foto.url;

    viewerDate.textContent =
        foto.data;

    viewerPosition.textContent =
        `${fotoAtual + 1} de ${listaFotos.length}`;


    /*
       Desabilita a seta esquerda
       quando estamos na primeira foto.
    */

    viewerPrevious.disabled =
        fotoAtual === 0;


    /*
       Desabilita a seta direita
       quando estamos na última foto.
    */

    viewerNext.disabled =
        fotoAtual ===
        listaFotos.length - 1;

}


/* =========================================================
   FOTO ANTERIOR
========================================================= */

function fotoAnterior() {

    if (fotoAtual <= 0) {
        return;
    }

    fotoAtual--;

    mostrarFotoAtual();
}


/* =========================================================
   PRÓXIMA FOTO
========================================================= */

function proximaFoto() {

    if (
        fotoAtual >=
        listaFotos.length - 1
    ) {
        return;
    }

    fotoAtual++;

    mostrarFotoAtual();
}


/* =========================================================
   EVENTOS DAS SETAS
========================================================= */

viewerPrevious.addEventListener(
    "click",
    fotoAnterior
);

viewerNext.addEventListener(
    "click",
    proximaFoto
);


/* =========================================================
   ABRIR VISUALIZADOR
========================================================= */

function abrirVisualizador(
    imageURL,
    data
) {

    atualizarListaFotos();

    /*
       Descobre qual foto foi clicada.
    */

    fotoAtual =
        listaFotos.findIndex(
            function (foto) {
                return foto.url === imageURL;
            }
        );


    /*
       Segurança caso não encontre.
    */

    if (fotoAtual === -1) {
        fotoAtual = 0;
    }

    mostrarFotoAtual();

    photoViewer.style.display =
        "flex";
}


/* =========================================================
   FECHAR VISUALIZADOR
========================================================= */

function fecharVisualizador() {

    photoViewer.style.display =
        "none";

    viewerImage.src =
        "";

}


/* =========================================================
   BOTÕES
========================================================= */

closePhotoViewer.addEventListener(
    "click",
    fecharVisualizador
);

viewerBack.addEventListener(
    "click",
    fecharVisualizador
);


/* =========================================================
   CLICAR FORA DA FOTO
========================================================= */

photoViewer.addEventListener(
    "click",
    function (event) {

        if (
            event.target === photoViewer
        ) {

            fecharVisualizador();

        }

    }
);


/* =========================================================
   ESC FECHA
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            photoViewer.style.display !== "flex"
        ) {
            return;
        }


        if (event.key === "Escape") {

            fecharVisualizador();

            return;
        }


        if (event.key === "ArrowLeft") {

            fotoAnterior();

            return;
        }


        if (event.key === "ArrowRight") {

            proximaFoto();

            return;
        }

    }
);

/* =========================================================
   EXCLUIR FOTO
========================================================= */

async function excluirFoto(
    imageURL,
    card
) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir essa fotinha?"
        );


    if (!confirmar) {

        return;

    }


    try {

        /* =================================================
           PEGA O CAMINHO DO ARQUIVO
        ================================================= */

        const marcador =
            "/storage/v1/object/public/photos/";

        const posicao =
            imageURL.indexOf(marcador);


        if (posicao === -1) {

            throw new Error(
                "Não foi possível identificar o arquivo."
            );

        }


        const caminho =
            imageURL.substring(
                posicao + marcador.length
            );


        /* =================================================
           REMOVE DO STORAGE
        ================================================= */

        const { error: storageError } =
            await supabaseClient
                .storage
                .from("photos")
                .remove([
                    caminho
                ]);


        if (storageError) {

            throw storageError;

        }


        /* =================================================
           REMOVE DA TABELA
        ================================================= */

        const { error: databaseError } =
            await supabaseClient
                .from("fotos")
                .delete()
                .eq(
                    "url",
                    imageURL
                );


        if (databaseError) {

            throw databaseError;

        }


        /* =================================================
           REMOVE DA TELA
        ================================================= */

        card.remove();

        atualizarListaFotos();

        atualizarContadorFotos();

    } catch (error) {

        console.error(
            "Erro ao excluir foto:",
            error
        );

        alert(
            "Não foi possível excluir a foto."
        );

    }

}

profileInput.addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
        atualizarFotoPerfil(file);
    }

    this.value = "";
});

function carregarFotoPerfil() {
    const caminhoPerfil = "profile/profile.jpg";

    const { data } =
        supabaseClient.storage
            .from("photos")
            .getPublicUrl(caminhoPerfil);

    const publicURL = `${data.publicUrl}?v=${Date.now()}`;

    const imagem = document.createElement("img");
    imagem.src = publicURL;
    imagem.alt = "Foto de perfil";

    imagem.onload = function () {
        profilePicture.innerHTML = "";
        profilePicture.appendChild(imagem);
    };

    imagem.onerror = function () {
        // Se ainda não existir foto, mantém a 🌸
        profilePicture.innerHTML = "🌸";
    };
}

carregarFotoPerfil();