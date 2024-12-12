import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    deleteDoc,
    doc,
    updateDoc,
    increment,
    arrayUnion,
    arrayRemove,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAIHCFvdJ7wiQy9-hlScx3jrMUq2q9fIgo",
    authDomain: "projeto-integrador-web.firebaseapp.com",
    projectId: "projeto-integrador-web",
    storageBucket: "projeto-integrador-web.appspot.com",
    messagingSenderId: "941573147907",
    appId: "1:941573147907:web:dca6e828977cbe9bcbad36",
    measurementId: "G-LESQZJVYPW",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Identificar o mês da página
const mesAtual = document.location.pathname.match(/mes(\d+)/)?.[1] || "mes1";

// Função para carregar comentários
async function carregarComentarios() {
    const comentariosLista = document.getElementById("comments-list");
    comentariosLista.innerHTML = ""; // Limpa a lista antes de carregar

    try {
        const comentariosQuery = query(
            collection(db, "comentarios"),
            where("mes", "==", `mes${mesAtual}`),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(comentariosQuery);

        if (querySnapshot.empty) {
            comentariosLista.innerHTML = "<p>Seja o primeiro a comentar!</p>";
            return;
        }

        querySnapshot.forEach((docSnapshot) => {
            const comentario = docSnapshot.data();
            const comentarioId = docSnapshot.id;
            const user = auth.currentUser;

            // Verifica se o usuário já curtiu
            const alreadyLiked = comentario.likedBy?.includes(user?.uid);

            const div = document.createElement("div");
            div.className = "comment-item";
            div.setAttribute("data-id", comentarioId);

            // Estrutura do comentário
            div.innerHTML = `
                <div class="comment-header">
                    <strong>${comentario.username || "Usuário Anônimo"}</strong>
                    ${
                        user && user.uid === comentario.uid
                            ? `
                                <div class="menu">
                                    <button class="menu-btn">⋮</button>
                                    <div class="menu-options hidden">
                                        <button class="edit-btn" data-id="${comentarioId}">Editar</button>
                                        <button class="delete-btn" data-id="${comentarioId}">Excluir</button>
                                    </div>
                                </div>
                            `
                            : ""
                    }
                </div>
                <p>${comentario.texto}</p>
                <div class="comment-footer">
                    <small class="date-time">${comentario.createdAt?.toDate().toLocaleString() || "Aguardando data..."}</small>
                    <div class="like-section">
                        <button class="like-btn" data-id="${comentarioId}" style="background-color: ${
                alreadyLiked ? "#90ee90" : "#f0f0f0"
            };">👍</button>
                        <span class="like-count">${comentario.likes || 0}</span>
                    </div>
                </div>
            `;

            comentariosLista.appendChild(div);
        });

        adicionarEventosCurtida(comentariosLista); // Adiciona eventos para curtidas
        adicionarEventosMenus(comentariosLista); // Adiciona eventos para os menus de exclusão/edição
    } catch (error) {
        console.error("Erro ao carregar comentários:", error);
    }
}

function adicionarEventosCurtida(comentariosLista) {
    // Remove ouvintes existentes antes de adicionar novos
    comentariosLista.replaceChildren(...comentariosLista.children); // Mantém elementos visuais sem eventos duplicados

    comentariosLista.addEventListener("click", async (e) => {
        if (e.target.classList.contains("like-btn")) {
            const commentItem = e.target.closest(".comment-item");
            const comentarioId = commentItem.getAttribute("data-id");
            await curtirComentario(comentarioId, commentItem);
        }
    });
}

// Adiciona eventos de menus (edição e exclusão)
function adicionarEventosMenus(comentariosLista) {
    // Manipula o clique no botão de menu
    comentariosLista.addEventListener("click", (e) => {
        if (e.target.classList.contains("menu-btn")) {
            const menu = e.target.nextElementSibling;

            // Fecha outros menus abertos
            document.querySelectorAll(".menu-options").forEach((menuAtivo) => {
                if (menuAtivo !== menu) {
                    menuAtivo.classList.remove("visible");
                    menuAtivo.classList.add("hidden");
                }
            });

            // Alterna o menu clicado
            menu.classList.toggle("visible");
        }
    });

    // Fecha o menu ao clicar fora dele
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".menu")) {
            document.querySelectorAll(".menu-options").forEach((menu) => {
                menu.classList.remove("visible");
                menu.classList.add("hidden");
            });
        }
    });

    // Configura eventos para exclusão e edição
    comentariosLista.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const comentarioId = e.target.getAttribute("data-id");
            excluirComentario(comentarioId);
        } else if (e.target.classList.contains("edit-btn")) {
            const comentarioId = e.target.getAttribute("data-id");
            editarComentario(comentarioId);
        }
    });
}

// Função para excluir comentário
// Configurar a modal
const modal = document.getElementById("modal");
const modalMessage = document.getElementById("modal-message");
const confirmButton = document.getElementById("confirm-button");
const cancelButton = document.getElementById("cancel-button");

async function excluirComentario(comentarioId) {
    return new Promise((resolve) => {
        // Abrir a modal com a mensagem
        modalMessage.textContent = "Você tem certeza que deseja excluir este comentário?";
        modal.classList.add("visible");

        // Confirmar exclusão
        confirmButton.onclick = async () => {
            try {
                await deleteDoc(doc(db, "comentarios", comentarioId));
                alert("Comentário excluído com sucesso!");
                carregarComentarios();
                resolve(true);
            } catch (error) {
                console.error("Erro ao excluir comentário:", error);
                alert("Erro ao excluir comentário. Tente novamente.");
                resolve(false);
            } finally {
                modal.classList.remove("visible");
            }
        };

        // Cancelar exclusão
        cancelButton.onclick = () => {
            modal.classList.remove("visible");
            resolve(false);
        };
    });
}


// Função para editar comentário
async function editarComentario(comentarioId) {
    const comentarioItem = document.querySelector(`.comment-item[data-id="${comentarioId}"]`);
    const comentarioTexto = comentarioItem.querySelector("p").innerText;

    const input = document.createElement("textarea");
    input.className = "edit-input";
    input.value = comentarioTexto;

    const saveButton = document.createElement("button");
    saveButton.innerText = "Salvar";
    saveButton.className = "save-edit-btn";

    comentarioItem.querySelector("p").replaceWith(input);
    comentarioItem.appendChild(saveButton);

    saveButton.addEventListener("click", async () => {
        const novoTexto = input.value.trim();
        if (!novoTexto) {
            alert("O comentário não pode estar vazio!");
            return;
        }

        try {
            const comentarioRef = doc(db, "comentarios", comentarioId);
            await updateDoc(comentarioRef, { texto: novoTexto });

            alert("Comentário atualizado com sucesso!");
            const novoParagrafo = document.createElement("p");
            novoParagrafo.innerText = novoTexto;
            input.replaceWith(novoParagrafo);
            saveButton.remove();
        } catch (error) {
            console.error("Erro ao atualizar o comentário:", error);
            alert("Erro ao atualizar o comentário. Tente novamente.");
        }
    });
}

// Função para adicionar comentário
async function adicionarComentario(event) {
    event.preventDefault();
    const comentarioTexto = document.getElementById("comment-input").value.trim();

    if (!comentarioTexto) {
        alert("Por favor, escreva um comentário.");
        return;
    }

    try {
        const user = auth.currentUser;
        if (!user) {
            alert("Você precisa estar logado para comentar.");
            return;
        }

        const userDisplayName = user.displayName || "Usuário Anônimo";

        await addDoc(collection(db, "comentarios"), {
            texto: comentarioTexto,
            mes: `mes${mesAtual}`,
            uid: user.uid,
            username: userDisplayName,
            createdAt: serverTimestamp(),
            likes: 0,
            likedBy: [], // Array vazio para rastrear curtidas
        });

        document.getElementById("comment-form").reset();
        carregarComentarios();
    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
    }
}

// Função para curtir comentário
async function curtirComentario(comentarioId, likeButton, likeCountSpan) {
    const user = auth.currentUser;
    if (!user) {
        alert("Você precisa estar logado para curtir.");
        return;
    }

    const comentarioRef = doc(db, "comentarios", comentarioId);

    try {
        const alreadyLiked = likeButton.style.backgroundColor === "rgb(144, 238, 144)"; // Verde claro

        if (alreadyLiked) {
            await updateDoc(comentarioRef, {
                likes: increment(-1),
                likedBy: arrayRemove(user.uid),
            });
            likeCountSpan.textContent = parseInt(likeCountSpan.textContent) - 1;
            likeButton.style.backgroundColor = "#f0f0f0"; // Cor neutra
        } else {
            await updateDoc(comentarioRef, {
                likes: increment(1),
                likedBy: arrayUnion(user.uid),
            });
            likeCountSpan.textContent = parseInt(likeCountSpan.textContent) + 1;
            likeButton.style.backgroundColor = "#90ee90"; // Verde claro
        }
    } catch (error) {
        console.error("Erro ao curtir comentário:", error);
    }
}

// Delegação de eventos para curtidas
document.getElementById("comments-list").addEventListener("click", async (e) => {
    if (e.target.classList.contains("like-btn")) {
        const commentItem = e.target.closest(".comment-item");
        const comentarioId = commentItem.getAttribute("data-id");
        const likeButton = e.target;
        const likeCountSpan = commentItem.querySelector(".like-count");

        // Chama a função para curtir
        await curtirComentario(comentarioId, likeButton, likeCountSpan);
        e.stopPropagation(); // Previne outros eventos indesejados
    }
});


// Configuração do formulário e carregamento inicial
document.addEventListener("DOMContentLoaded", () => {
    const comentarioForm = document.getElementById("comment-form");
    if (comentarioForm) {
        comentarioForm.addEventListener("submit", adicionarComentario);
    }

    carregarComentarios();
});
