import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('profile')) {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    req.headers.Authorization = `Bearer ${profile.token}`;
  }
  return req;
});

export const signIn = (formData: any) => API.post('/auth/login', formData);
export const signUp = (formData: any) => API.post('/auth/register', formData);
export const apiChangePassword = (data: any) => API.post('/auth/change-password', data);

export const fetchExpenses = () => API.get('/expenses');
export const fetchUsers = () => API.get('/users');
export const createExpense = (newExpense: any) => API.post('/expenses', newExpense);
export const deleteExpense = (id: string) => API.delete(`/expenses/${id}`);

export const fetchGroups = () => API.get('/groups');
export const createGroup = (newGroup: any) => API.post('/groups', newGroup);
export const joinGroup = (inviteCode: string) => API.post('/groups/join', { inviteCode });
export const fetchGroupDetails = (id: string) => API.get(`/groups/${id}`);
export const deleteGroup = (id: string) => API.delete(`/groups/${id}`);

export default API;
