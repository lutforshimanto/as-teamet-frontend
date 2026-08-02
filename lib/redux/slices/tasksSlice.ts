import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Task, TaskStatus } from '@/lib/types';

interface TasksState {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filter: 'today' | 'all' | 'month' | 'range';
}

const initialState: TasksState = {
  items: [],
  status: 'idle',
  error: null,
  filter: 'today',
};

interface FetchTasksParams {
  startDate?: string;
  endDate?: string;
  month?: string;
  status?: string;
  mine?: boolean;
}

export const fetchTasks = createAsyncThunk<Task[], FetchTasksParams | void>(
  'tasks/fetchTasks',
  async (params) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.month) query.set('month', params.month);
    if (params?.status) query.set('status', params.status);
    if (params?.mine) query.set('mine', 'true');
    const res = await fetch(`/api/tasks?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return (await res.json()) as Task[];
  }
);

type CreateTaskPayload = Partial<Task> & {
  assignedEmployees?: string[];
  client?: string;
  startDate?: string;
  endDate?: string;
  status?: TaskStatus;
};

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (task: CreateTaskPayload) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return (await res.json()) as Task;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: string; data: Partial<Task> }) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return (await res.json()) as Task;
  }
);

export const updateTaskProgress = createAsyncThunk(
  'tasks/updateTaskProgress',
  async ({ id, startDate, endDate, status }: { id: string; startDate?: string; endDate?: string; status?: TaskStatus }) => {
    const res = await fetch(`/api/tasks/${id}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, status }),
    });
    if (!res.ok) throw new Error('Failed to update progress');
    return (await res.json()) as Task;
  }
);

export const logHours = createAsyncThunk(
  'tasks/logHours',
  async ({ id, data }: { id: string; data: { date: string; hours: number; notes?: string; employee?: string; startTime?: string; endTime?: string } }) => {
    const res = await fetch(`/api/tasks/${id}/hours`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to log hours');
    return (await res.json()) as Task;
  }
);

export const addPhoto = createAsyncThunk(
  'tasks/addPhoto',
  async ({ id, photoUrl }: { id: string; photoUrl: string }) => {
    const res = await fetch(`/api/tasks/${id}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: photoUrl }),
    });
    if (!res.ok) throw new Error('Failed to add photo');
    return (await res.json()) as Task;
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed';
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateTaskProgress.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(logHours.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(addPhoto.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export const { setFilter } = tasksSlice.actions;
export default tasksSlice.reducer;
