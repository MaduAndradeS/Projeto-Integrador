import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAIHCFvdJ7wiQy9-hlScx3jrMUq2q9fIgo",
    authDomain: "projeto-integrador-web.firebaseapp.com",
    projectId: "projeto-integrador-web",
    storageBucket: "projeto-integrador-web.appspot.com", // Corrigido o domínio do storage
    messagingSenderId: "941573147907",
    appId: "1:941573147907:web:dca6e828977cbe9bcbad36",
    measurementId: "G-LESQZJVYPW"
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

    console.log("Iniciando carregamento de comentários...");
    try {
        const comentariosQuery = query(
            collection(db, "comentarios"),
            where("mes", "==", `mes${mesAtual}`), // Filtra pelo mês atual
            orderBy("createdAt", "desc") // Ordena por data
        );

        console.log("Query criada:", comentariosQuery);

        const querySnapshot = await getDocs(comentariosQuery);

        console.log("Comentários encontrados:", querySnapshot.docs.length);

        if (querySnapshot.empty) {
            comentariosLista.innerHTML = "<p>Seja o primeiro a comentar!</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const comentario = doc.data();
            console.log("Comentário carregado:", comentario);

            const div = document.createElement("div");
            div.className = "comment-item";
            div.innerHTML = `
                <p>${comentario.texto}</p>
                <small>${comentario.createdAt?.toDate().toLocaleString() || "Aguardando data..."}</small>
            `;
            comentariosLista.appendChild(div);
        });
    } catch (error) {
        console.error("Erro ao carregar comentários:", error);
    }
}


// Função para adicionar comentário
async function adicionarComentario(event) {
    event.preventDefault(); // Impede o recarregamento da página
    const comentarioTexto = document.getElementById("comment-input").value.trim();

    if (!comentarioTexto) {
        alert("Por favor, escreva um comentário.");
        return;
    }

    try {
        const user = auth.currentUser; // Verifica se o usuário está logado
        if (!user) {
            alert("Você precisa estar logado para comentar.");
            return;
        }

        // Adiciona o comentário no Firestore
        await addDoc(collection(db, "comentarios"), {
            texto: comentarioTexto,
            mes: `mes${mesAtual}`, // Identifica o mês atual
            uid: user.uid,
            createdAt: serverTimestamp(), // Timestamp automático
        });

        alert("Comentário enviado com sucesso!");
        document.getElementById("comment-form").reset(); // Limpa o campo de texto
        carregarComentarios(); // Atualiza a lista de comentários
    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
    }
}

// Configuração do formulário
document.addEventListener("DOMContentLoaded", () => {
    const comentarioForm = document.getElementById("comment-form");
    if (comentarioForm) {
        comentarioForm.addEventListener("submit", adicionarComentario);
    }

    carregarComentarios(); // Carregar comentários ao carregar a página
});