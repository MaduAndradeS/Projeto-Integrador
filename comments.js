document.addEventListener("DOMContentLoaded", () => {
    // Variáveis globais
    const bookMonth = "mes1"; // Altere para o mês correspondente dinamicamente
    const commentForm = document.getElementById("comment-form"); // Formulário de comentários
    const commentInput = document.getElementById("comment-input"); // Campo de texto para o comentário
    const commentsList = document.getElementById("comments-list"); // Área para exibir os comentários

    // Função para carregar os comentários da API
    const loadComments = async () => {
        try {
            const response = await fetch(`http://localhost:3000/comments/${bookMonth}`);
            if (!response.ok) {
                throw new Error("Erro ao buscar comentários");
            }
            const comments = await response.json();
            // Atualizar os comentários no HTML
            commentsList.innerHTML = comments
                .map(
                    (c) =>
                        `<p><strong>${c.username}</strong>: ${c.comment} <em>${new Date(
                            c.created_at
                        ).toLocaleString()}</em></p>`
                )
                .join("");
        } catch (error) {
            console.error("Erro ao carregar comentários:", error);
            commentsList.innerHTML = "<p>Erro ao carregar comentários.</p>";
        }
    };

    // Função para enviar um novo comentário
    commentForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Evita o comportamento padrão do formulário

        const comment = commentInput.value.trim(); // Captura o texto do comentário
        if (!comment) {
            alert("Por favor, escreva algo antes de enviar!");
            return; // Não permite o envio de comentários vazios
        }

        const token = localStorage.getItem("token"); // Recupera o token JWT do localStorage
        if (!token) {
            alert("Você precisa estar logado para comentar.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({ book_month: bookMonth, comment }),
            });

            if (response.ok) {
                commentInput.value = ""; // Limpa o campo de texto após o envio
                loadComments(); // Atualiza os comentários exibidos
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Erro ao enviar comentário.");
            }
        } catch (error) {
            console.error("Erro ao enviar comentário:", error);
            alert("Erro ao enviar comentário. Tente novamente mais tarde.");
        }
    });

    // Carregar os comentários ao carregar a página
    loadComments();
});
