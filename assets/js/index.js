// Configuração - Link da API no Railway
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

// Mostrar mensagem de status
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

// Esconder mensagem
function hideMessage() {
  statusMessage.style.display = "none";
}
closeMessage.addEventListener("click", hideMessage);

// Renderiza lista de usuários
function renderUserList(users) {
  userList.innerHTML = "";
  if (users.length === 0) {
    userList.innerHTML = "<p>Nenhum usuário encontrado</p>";
    return;
  }

  users.forEach((user) => {
    const userCard = document.createElement("div");
    userCard.className = "user-card";
    userCard.innerHTML = `
      <h3>${user.nome}</h3>
      <p>${user.email}</p>
      <span class="user-id">ID: ${user.id}</span>
      <p>Status: ${user.status == 1 ? "Ativo" : "Inativo"}</p>
      <button onclick="editUser(${user.id}, '${user.nome}', '${
      user.email
    }')">Editar</button>
      <button onclick="deleteUser(${user.id})">Excluir</button>
      ${
        user.status == 1
          ? `<button onclick="deactivateUser(${user.id})">Desativar</button>`
          : `<button onclick="reactivateUser(${user.id})">Reativar</button>`
      }
    `;
    userList.appendChild(userCard);
  });
}

// Criar novo usuário
async function createUser(userData) {
  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao criar usuário");
    }
    showMessage("Usuário criado com sucesso!", "success");
    userForm.reset();
    fetchUsers();
  } catch (error) {
    console.error("Erro:", error);
    showMessage(error.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Criar Usuário";
  }
}

// Editar usuário
async function editUser(id, nome, email) {
  const newNome = prompt("Novo nome:", nome);
  const newEmail = prompt("Novo email:", email);
  if (newNome === null || newEmail === null) return;

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: newNome, email: newEmail }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao editar usuário");
    }
    showMessage("Usuário editado com sucesso!", "success");
    fetchUsers();
  } catch (error) {
    console.error("Erro:", error);
    showMessage(error.message, "error");
  }
}

// Excluir usuário
async function deleteUser(id) {
  if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao excluir usuário");
    }
    showMessage("Usuário excluído com sucesso!", "success");
    fetchUsers();
  } catch (error) {
    console.error("Erro:", error);
    showMessage(error.message, "error");
  }
}

// Desativar usuário
async function deactivateUser(id) {
  if (!confirm("Deseja desativar este usuário?")) return;
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}/desativar`, {
      method: "PATCH",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao desativar usuário");
    }
    showMessage("Usuário desativado com sucesso!", "success");
    fetchUsers();
  } catch (error) {
    console.error("Erro:", error);
    showMessage(error.message, "error");
  }
}

// Reativar usuário
async function reactivateUser(id) {
  if (!confirm("Deseja reativar este usuário?")) return;
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}/reativar`, {
      method: "PATCH",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao reativar usuário");
    }
    showMessage("Usuário reativado com sucesso!", "success");
    fetchUsers();
  } catch (error) {
    console.error("Erro:", error);
    showMessage(error.message, "error");
  }
}

// Envio do formulário
userForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  if (!nome || !email) {
    showMessage("Nome e email são obrigatórios", "error");
    return;
  }
  createUser({ nome, email });
});

// Mostrar/ocultar formulário
document.getElementById("toggleFormBtn").addEventListener("click", () => {
  const formSection = document.getElementById("formSection");
  formSection.style.display =
    formSection.style.display === "none" ? "block" : "none";
});

// Função debounce
function debounce(func, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

// Função de busca de usuários
async function handleUserSearch(searchTerm) {
  const search = searchTerm.trim().toLowerCase();
  const userList = document.getElementById("userList");

  if (!search) {
    fetchUsers(); // Mostra todos
    return;
  }

  try {
    const response = await fetch(
      "https://api-production-554a.up.railway.app/usuarios"
    );
    const users = await response.json();

    const filtered = users.filter(
      (user) =>
        user.nome.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
    );

    userList.innerHTML = "";

    if (filtered.length === 0) {
      userList.innerHTML = "<p>Nenhum usuário encontrado</p>";
      return;
    }

    filtered.forEach((user) => {
      const card = document.createElement("div");
      card.className = "user-card";
      card.innerHTML = `
          <h3>${user.nome}</h3>
          <p>${user.email}</p>
          <span class="user-id">ID: ${user.id}</span>
          <p>Status: ${user.status == 1 ? "Ativo" : "Inativo"}</p>
          <button onclick="editUser(${user.id}, '${user.nome}', '${
        user.email
      }')">Editar</button>
          <button onclick="deleteUser(${user.id})">Excluir</button>
          ${
            user.status == 1
              ? `<button onclick="deactivateUser(${user.id})">Desativar</button>`
              : `<button onclick="reactivateUser(${user.id})">Reativar</button>`
          }
        `;
      userList.appendChild(card);
    });
  } catch (err) {
    console.error("Erro na busca:", err);
  }
}

// Aplica debounce de 300ms
const debouncedSearch = debounce((e) => handleUserSearch(e.target.value), 300);

document
  .getElementById("searchInput")
  .addEventListener("input", debouncedSearch);

// Inicializar
document.addEventListener("DOMContentLoaded", fetchUsers);
