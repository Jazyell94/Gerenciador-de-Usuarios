// Configuração - Link da api no railway
const API_BASE_URL = "https://api-production-554a.up.railway.app";

// Elementos do DOM
const userForm = document.getElementById("userForm");
const userList = document.getElementById("userList");
const submitBtn = document.getElementById("submitBtn");
const statusMessage = document.getElementById("statusMessage");
const messageText = document.getElementById("messageText");
const closeMessage = document.getElementById("closeMessage");
const apiUrlSpan = document.getElementById("apiUrl");

// Mostra a URL da API no footer da pagina
apiUrlSpan.textContent = API_BASE_URL;

// Mostrar mensagem de status na lista de usuarios
function showMessage(message, type = "success") {
  messageText.textContent = message;
  statusMessage.className = `status-message ${type}`;
  setTimeout(() => {
    statusMessage.style.display = "flex";
  }, 100);

  setTimeout(() => {
    hideMessage();
  }, 5000);
}

// Esconder mensagem de status
function hideMessage() {
  statusMessage.style.display = "none";
}

// Fechar mensagem ao clicar no botão
closeMessage.addEventListener("click", hideMessage);

// Buscar todos os usuários
async function fetchUsers() {
  try {
    userList.innerHTML = '<div class="loading">Carregando usuários...</div>';

    const response = await fetch(`${API_BASE_URL}/usuarios`);

    if (!response.ok) {
      throw new Error("Erro ao buscar usuários");
    }

    const users = await response.json();

    if (users.length === 0) {
      userList.innerHTML = "<p>Nenhum usuário cadastrado</p>";
      return;
    }

    userList.innerHTML = "";
    users.forEach((user) => {
      const userCard = document.createElement("div");
      userCard.className = "user-card";
      userCard.innerHTML = `
                        <h3>${user.nome}</h3>
                        <p>${user.email}</p>
                        <span class="user-id">ID: ${user.id}</span>
                        <button onclick="editUser (${user.id}, '${user.nome}', '${user.email}')">Editar</button>
                        <button onclick="deleteUser (${user.id})">Excluir</button>
                        <button onclick="deactivateUser (${user.id})">Desativar</button>
                    `;
      userList.appendChild(userCard);
    });
  } catch (error) {
    console.error("Erro:", error);
    userList.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

// Criar novo usuário
async function createUser (userData) {
  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao criar usuário");
    }

    const newUser  = await response.json();
    showMessage("Usuário criado com sucesso!", "success");
    userForm.reset();
    fetchUsers(); // Atualiza a lista
  } catch (error) {
    console.error("Erro:", error);
    showMessage(error.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Criar Usuário";
  }
}

// Editar usuário
async function editUser (id, nome, email) {
  const newNome = prompt("Novo nome:", nome);
  const newEmail = prompt("Novo email:", email);

  if (newNome === null || newEmail === null) {
    return; // Cancelado
  }

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome: newNome, email: newEmail }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao editar usuário");
    }

    showMessage("Usuário editado com sucesso!", "success");
    fetchUsers(); // Atualiza a lista
  } catch (error) {
    console.error("Erro:", error);
    showMessage(error.message, "error");
  }
}

// Excluir usuário
async function deleteUser (id) {
  if (!confirm("Tem certeza que deseja excluir este usuário?")) {
    return; // Cancelado
  }

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao excluir usuário");
    }

    showMessage("Usuário excluído com sucesso!", "success");
    fetchUsers(); // Atualiza a lista
  } catch (error) {
    console.error("Erro:", error);
    showMessage(error.message, "error");
  }
}

// Desativar usuário
async function deactivateUser (id) {
  if (!confirm("Tem certeza que deseja desativar este usuário?")) {
    return; // Cancelado
  }

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}/desativar`, {
      method: "PATCH",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao desativar usuário");
    }

    showMessage("Usuário desativado com sucesso!", "success");
    fetchUsers(); // Atualiza a lista
  } catch (error) {
    console.error("Erro:", error);
    showMessage(error.message, "error");
  }
}

// Manipular envio do formulário
userForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!nome || !email) {
    showMessage("Nome e email são obrigatórios", "error");
    return;
  }

  createUser ({ nome, email });
});

// Inicializa a aplicação
document.addEventListener("DOMContentLoaded", fetchUsers);
