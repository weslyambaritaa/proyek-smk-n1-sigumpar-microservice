import { useState, useCallback } from "react";
import * as todosApi from "../api/todosApi";

/**
 * Custom Hook: useTodos
 * Mengelola state dan operasi CRUD untuk data todos.
 */
const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTodos = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await todosApi.fetchTodos(params);
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTodo = useCallback(async (todoData) => {
    setLoading(true);
    setError(null);
    try {
      const newTodo = await todosApi.createTodo(todoData);
      setTodos((prev) => [...prev, newTodo]);
      return newTodo;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const editTodo = useCallback(async (id, todoData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await todosApi.updateTodo(id, todoData);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeTodo = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await todosApi.deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { todos, loading, error, loadTodos, addTodo, editTodo, removeTodo };
};

export default useTodos;