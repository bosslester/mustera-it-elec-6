const express = require('express');
const router = express.Router();
const Todo = require('../models/todo');

// CREATE
router.post('', async (req, res) => {
  const todo = new Todo({
    title: req.body.title,
    completed: false,
    userId: req.body.userId
  });

  const result = await todo.save();
  res.status(201).json({ message: 'Todo created!', todo: result });
});

// READ
router.get('/:userId', async (req, res) => {
  const todos = await Todo.find({ userId: req.params.userId });
  res.status(200).json(todos);
});

// UPDATE
router.put('/:id', async (req, res) => {
  const updatedTodo = {
    title: req.body.title,
    completed: req.body.completed
  };

  await Todo.updateOne({ _id: req.params.id }, updatedTodo);
  res.status(200).json({ message: 'Todo updated!' });
});

// DELETE
router.delete('/:id', async (req, res) => {
  await Todo.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: 'Todo deleted!' });
});

module.exports = router;
