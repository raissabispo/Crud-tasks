# 📌 Task Management API

## 📖 Descrição
Esta é uma API RESTful para gerenciamento de tarefas, permitindo a criação, consulta, atualização, remoção e importação de tarefas a partir de um arquivo CSV.

## 🛠️ Tecnologias Utilizadas
- 🟢 Node.js
- 📄 Fast CSV
- 🔄 CSV Stringify
- 🗄️ Banco de dados em memória

## 🔗 Endpoints

### ✍️ Criar uma nova tarefa
**POST /tasks**

**Request Body:**
```json
{
  "title": "Nome da tarefa",
  "description": "Descrição detalhada da tarefa"
}
```
**Response:** ✅ 201 Created

---

### 📜 Listar todas as tarefas
**GET /tasks**

**Query Params:** (opcional)
- 🔍 `search`: Filtra por título ou descrição

**Response:** ✅ 200 OK (JSON contendo a lista de tarefas)

---

### ✏️ Atualizar uma tarefa
**PUT /tasks/:id**

**Request Body:**
```json
{
  "title": "Novo título",
  "description": "Nova descrição"
}
```
**Response:** ✅ 204 No Content

---

### 🗑️ Remover uma tarefa
**DELETE /tasks/:id**

**Response:** ✅ 204 No Content

---

### ✅ Marcar uma tarefa como concluída ou reabrir
**PATCH /tasks/:id/complete**

**Response:** ✅ 204 No Content

---

### 📥 Importar tarefas a partir de um arquivo CSV
**POST /tasks/import**

**Response:** ✅ 201 Created (Importa e salva as tarefas do arquivo CSV)

## 📂 Formato da Tarefa
```json
{
  "id": "uuid",
  "title": "Título da tarefa",
  "description": "Descrição da tarefa",
  "completed_at": "2024-03-28T12:00:00.000Z" (ou null),
  "created_at": "2024-03-28T10:00:00.000Z",
  "updated_at": "2024-03-28T11:00:00.000Z"
}
```

## 🚀 Como Executar o Projeto
1. Instale as dependências:
```sh
npm install
```
2. Inicie a API:
```sh
npm run dev
```

A API estará disponível em `http://localhost:3000`.

