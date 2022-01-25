const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const userIndex = users.findIndex((item) => item.username === username);
  if(userIndex === -1) {
    return response.status(401).json({ error: "Unauthorized" });
  };

  request.userIndex = userIndex;
  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const userIndex = users.findIndex((value) => value.username === username);
  if(userIndex !== -1) {
    return response.status(400).json({ error: "User alredy exists" });
  };

  const user = { id: uuid(), name, username, todos: [] };
  users.push(user);

  return response.status(201).json({ ...user });
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {userIndex} = request;
  return response.status(200).json([ ...users[userIndex].todos ]);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {userIndex} = request;
  const {title, deadline} = request.body;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  users[userIndex].todos.push(todo);
  return response.status(201).json({ ...todo });
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {userIndex} = request;
  const {id} = request.params;
  const {title, deadline} = request.body;

  const todoIndex = users[userIndex].todos.findIndex(item => item.id === id);
  if(todoIndex === -1) {
    return response.status(404).json({ error: "todo not found." });
  };

  users[userIndex].todos[todoIndex].title = title;
  users[userIndex].todos[todoIndex].deadline = new Date(deadline);

  return response.status(200).json({ ...users[userIndex].todos[todoIndex] });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {userIndex} = request;
  const {id} = request.params;

  const todoIndex = users[userIndex].todos.findIndex(item => item.id === id);
  if(todoIndex === -1) {
    return response.status(404).json({ error: "todo not found." });
  };

  users[userIndex].todos[todoIndex].done = true;
  return response.status(200).json({ ...users[userIndex].todos[todoIndex] });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {userIndex} = request;
  const {id} = request.params;

  const todoIndex = users[userIndex].todos.findIndex(item => item.id === id);
  if(todoIndex === -1) {
    return response.status(404).json({ error: "todo not found." });
  };

  users[userIndex].todos = users[userIndex].todos.filter(item => item.id !== id);
  return response.status(204).send();
});

module.exports = app;