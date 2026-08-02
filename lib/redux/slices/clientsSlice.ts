import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Client } from '@/lib/types';

interface ClientsState {
  items: Client[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ClientsState = { items: [], status: 'idle', error: null };

export const fetchClients = createAsyncThunk('clients/fetchClients', async () => {
  const res = await fetch('/api/clients');
  if (!res.ok) throw new Error('Failed to fetch clients');
  return (await res.json()) as Client[];
});

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (client: { name: string; address: string; phone: string }) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    if (!res.ok) throw new Error('Failed to create client');
    return (await res.json()) as Client;
  }
);

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ id, data }: { id: string; data: Partial<Client> }) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update client');
    return (await res.json()) as Client;
  }
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id: string) => {
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete client');
    return id;
  }
);

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed';
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload);
      });
  },
});

export default clientsSlice.reducer;
