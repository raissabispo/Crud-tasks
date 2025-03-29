import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from '../utils/build-route-path.js';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'fast-csv';
import { stringify } from 'csv-stringify';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const database = new Database();

function getBrasiliaTime() {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = formatter.formatToParts(new Date());
  const date = parts.reduce((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  return `${date.year}-${date.month}-${date.day}T${date.hour}:${date.minute}:${date.second}-03:00`;
}

export const routes = [

  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body;
  
      if (!title || !description) {
        return res.writeHead(400).end('Title and description are required');
      }
  
      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: getBrasiliaTime(), // Usando o horário de Brasília
        updated_at: getBrasiliaTime(),
      };
  
      database.insert('tasks', task);
  
      return res.writeHead(201).end(JSON.stringify(task));
    }
  },

  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query;
  
      // Busca todas as tarefas ou filtra com base na query
      const tasks = database.select('tasks', search ? { title: search, description: search } : null);
  
      // Retorna as tarefas no formato JSON
      return res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(tasks));
    }
  },

  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      const task = database.find('tasks', id);

      if (!task) {
        return res.writeHead(404).end('Task not found');
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;

      database.update('tasks', id, updateData);

      return res.writeHead(204).end();
    }
  },

  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;
      const task = database.find('tasks', id);

      if (!task) {
        return res.writeHead(404).end('Task not found');
      }

      database.delete('tasks', id);
      return res.writeHead(204).end();
    }
  },

  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params;
      const task = database.find('tasks', id);

      if (!task) {
        return res.writeHead(404).end('Task not found');
      }

      const completed_at = task.completed_at ? null : new Date().toISOString();
      database.update('tasks', id, { completed_at });

      return res.writeHead(204).end();
    }
  },

  {
    method: 'POST',
    path: buildRoutePath('/tasks/import'),
    handler: async (req, res) => {
      const filePath = path.join(__dirname, 'uploads', 'tasks.csv');
      const tasks = [];
  
      try {
        // Lê o arquivo CSV existente
        const fileStream = fs.createReadStream(filePath);
        const parser = fileStream.pipe(parse({ columns: true, skip_empty_lines: true }));
  
        for await (const row of parser) {
          const task = {
            id: randomUUID(),
            title: row.title || 'Título Padrão', // Preenche título vazio
            description: row.description || 'Descrição Padrão', // Preenche descrição vazia
            completed_at: null,
            created_at: getBrasiliaTime(),
            updated_at: getBrasiliaTime(),
          };
          tasks.push(task);
        }
  
        // Adiciona as tarefas ao banco de dados
        tasks.forEach(task => database.insert('tasks', task));
  
        // Salva as tarefas no arquivo CSV
        const csvStream = stringify({ header: true });
        const writeStream = fs.createWriteStream(filePath);
  
        csvStream.pipe(writeStream);
  
        // Ordena as tarefas por data de criação e escreve no CSV
        tasks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        tasks.forEach(task => csvStream.write(task));
  
        csvStream.end();
  
        return res.writeHead(201).end('Tasks imported and saved successfully');
      } catch (error) {
        console.error(error);
        return res.writeHead(500).end('Error processing the CSV file');
      }
    }
  }
];