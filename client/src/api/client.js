import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Folders
export const fetchTree = async () => {
  const { data } = await api.get('/folders/tree');
  return data;
};

export const createFolder = async (title, parentId) => {
  const { data } = await api.post('/folders', { title, parentId });
  return data;
};

export const updateFolder = async (id, title) => {
  const { data } = await api.patch(`/folders/${id}`, { title });
  return data;
};

export const deleteFolder = async (id) => {
  const { data } = await api.delete(`/folders/${id}`);
  return data;
};

export const copyFolder = async (id) => {
  const { data } = await api.post(`/folders/${id}/copy`);
  return data;
};

export const shareFolder = async (id) => {
  const { data } = await api.post(`/folders/${id}/share`);
  return data;
};

// Notes
export const fetchNote = async (id) => {
  const { data } = await api.get(`/notes/${id}`);
  return data;
};

export const createNote = async (title, folderId) => {
  const { data } = await api.post('/notes', { title, folderId });
  return data;
};

export const updateNote = async (id, updates) => {
  const { data } = await api.patch(`/notes/${id}`, updates);
  return data;
};

export const deleteNote = async (id) => {
  const { data } = await api.delete(`/notes/${id}`);
  return data;
};

export const shareNote = async (id) => {
  const { data } = await api.post(`/notes/${id}/share`);
  return data;
};

// Shared
export const fetchShared = async (token) => {
  const { data } = await api.get(`/share/${token}`);
  return data;
};
