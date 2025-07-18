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
function renderUserList(users, showActions = false) {
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
      <p>${user.telefone}</p>
      <span class="user-id">ID: ${user.id}</span>
      <p>Status: ${user.status == 1 ? "Ativo" : "Inativo"}</p>
      ${
        showActions
          ? `
      <div class="user-actions">
        <button class="btn btn-edit" onclick="editUser(${user.id}, '${
              user.nome
            }', '${user.email}', '${user.telefone}')">Editar</button>
        <button class="btn btn-delete" onclick="deleteUser(${
          user.id
        })">Excluir</button>
        ${
          user.status == 1
            ? `<button class="btn btn-deactivate" onclick="deactivateUser(${user.id})">Desativar</button>`
            : `<button class="btn btn-reactivate" onclick="reactivateUser(${user.id})">Reativar</button>`
        }
      </div>
    `
          : ""
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
async function editUser(id, nome, email, telefone) {
  const newNome = prompt("Novo nome:", nome);
  const newEmail = prompt("Novo email:", email);
  const newTelefone = prompt("Novo telefone:", telefone);
  if (newNome === null || newEmail === null || newTelefone === null) return;

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: newNome,
        email: newEmail,
        telefone: newTelefone,
      }),
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

async function fetchUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/status/1`);
    const users = await response.json();
    renderUserList(users, false); // false = não mostrar botões
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
  }
}

function formatTelefone(telefone) {
  const nums = telefone.replace(/\D/g, "");
  if (nums.length === 11) {
    return nums.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  } else if (nums.length === 10) {
    return nums.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  } else {
    return telefone;
  }
}

function validarEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

// No submit do form
if (!validarEmail(email)) {
  alert('Email inválido!');
  return;
}

// Envio do formulário
userForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const contato = document.getElementById("contato").value.trim();

  if (!nome || !contato) {
    showMessage("Informe o nome e um e-mail ou telefone.", "error");
    return;
  }

  // Regex simples para validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmail = emailRegex.test(contato);

  let userData = { nome };

  if (isEmail) {
    userData.email = contato;   // <-- Corrigido aqui
    userData.telefone = null;   // campo vazio como null
  } else {
    userData.telefone = formatTelefone(contato);
    userData.email = null;      // campo vazio como null
  }

  createUser(userData);
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
  if (!search) {
    fetchUsers();
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios`);
    const users = await response.json();

    const filtered = users.filter((user) => {
      const nome = user.nome || "";
      const email = user.email || "";
      const telefone = user.telefone || "";

      return (
        nome.toLowerCase().includes(search) ||
        email.toLowerCase().includes(search) ||
        telefone.toLowerCase().includes(search)
      );
    });

    renderUserList(filtered, true); // true = mostrar botões
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



