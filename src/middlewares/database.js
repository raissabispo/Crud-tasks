import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs'; // Importa createWriteStream do módulo correto
import path from 'node:path';
import { stringify } from 'csv-stringify';

// Define o caminho absoluto para o arquivo db.json na raiz do projeto
const databasePath = path.resolve(process.cwd(), 'db.json');

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then(data => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    // Salva o banco de dados no arquivo db.json
    fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2))
      .catch(error => console.error('Erro ao salvar o arquivo db.json:', error));
  
    // Salva as tarefas no arquivo tasks.csv
    const tasks = this.#database['tasks'] ?? [];
    const csvPath = path.resolve(process.cwd(), 'src/middlewares/uploads/tasks.csv');
  
    const csvStream = stringify({ header: true });
    const writeStream = createWriteStream(csvPath); // Usa createWriteStream do módulo correto
  
    csvStream.pipe(writeStream);
  
    tasks.forEach(task => csvStream.write(task));
  
    csvStream.end();
  }
  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase());
        });
      });
    }

    return data;
  }

  insert(table, data) {
    if (!Array.isArray(this.#database[table])) {
      this.#database[table] = [];
    }
    this.#database[table].push(data);
    this.#persist();
    return data;
  }

  find(table, id) {
    const data = this.#database[table] ?? [];
    return data.find(item => item.id === id);
  }

  update(table, id, newData) {
    const data = this.#database[table] ?? [];
    const index = data.findIndex(item => item.id === id);

    if (index !== -1) {
      this.#database[table][index] = {
        ...data[index],
        ...newData,
        updated_at: new Date().toISOString(),
      };
      this.#persist();
    }
  }

  delete(table, id) {
    const data = this.#database[table] ?? [];
    this.#database[table] = data.filter(item => item.id !== id);
    this.#persist();
  }
}