import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Task, TaskStatus } from "@/lib/types";

interface TasksState {
  items: Task[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  filter: "today" | "all" | "month" | "range";
}

const initialState: TasksState = {
  items: [],
  status: "idle",
  error: null,
  filter: "today",
};

interface FetchTasksParams {
  startDate?: string;
  endDate?: string;
  month?: string;
  status?: string;
  mine?: boolean;
}

interface TaskThunkResult {
  task: Task;
  message?: string;
}

interface TaskThunkError {
  message: string;
}

function getPayloadMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const candidate = payload as Record<string, unknown>;
    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }
    if (typeof candidate.error === "string" && candidate.error.trim()) {
      return candidate.error;
    }
  }
  return fallback;
}

async function readResponsePayload(res: Response, fallback: string) {
  const text = await res.text();
  let payload: unknown = text;

  try {
    payload = JSON.parse(text);
  } catch {
    // keep raw text
  }

  if (!res.ok) {
    throw new Error(getPayloadMessage(payload, fallback));
  }

  return {
    payload,
    message: getPayloadMessage(payload, ""),
  };
}

export const fetchTasks = createAsyncThunk<Task[], FetchTasksParams | void>(
  "tasks/fetchTasks",
  async (params) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);
    if (params?.month) query.set("month", params.month);
    if (params?.status) query.set("status", params.status);
    if (params?.mine) query.set("mine", "true");
    const res = await fetch(`/api/tasks?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return (await res.json()) as Task[];
  },
);

type CreateTaskPayload = Partial<Task> & {
  assignedEmployees?: string[];
  client?: string;
  startDate?: string;
  endDate?: string;
  status?: TaskStatus;
};

export const createTask = createAsyncThunk<
  TaskThunkResult,
  CreateTaskPayload,
  { rejectValue: TaskThunkError }
>("tasks/createTask", async (task: CreateTaskPayload, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    const { payload, message } = await readResponsePayload(
      res,
      "Failed to create task",
    );
    const taskPayload =
      payload &&
      typeof payload === "object" &&
      "task" in payload &&
      (payload as { task?: Task }).task
        ? (payload as { task: Task }).task
        : (payload as Task);
    return { task: taskPayload, message: message || undefined };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create task";
    return rejectWithValue({ message });
  }
});

export const updateTask = createAsyncThunk<
  TaskThunkResult,
  { id: string; data: Partial<Task> },
  { rejectValue: TaskThunkError }
>(
  "tasks/updateTask",
  async (
    { id, data }: { id: string; data: Partial<Task> },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const { payload, message } = await readResponsePayload(
        res,
        "Failed to update task",
      );
      const taskPayload =
        payload &&
        typeof payload === "object" &&
        "task" in payload &&
        (payload as { task?: Task }).task
          ? (payload as { task: Task }).task
          : (payload as Task);
      return { task: taskPayload, message: message || undefined };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update task";
      return rejectWithValue({ message });
    }
  },
);

export const updateTaskProgress = createAsyncThunk<
  TaskThunkResult,
  { id: string; startDate?: string; endDate?: string; status?: TaskStatus },
  { rejectValue: TaskThunkError }
>(
  "tasks/updateTaskProgress",
  async (
    {
      id,
      startDate,
      endDate,
      status,
    }: {
      id: string;
      startDate?: string;
      endDate?: string;
      status?: TaskStatus;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`/api/tasks/${id}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, status }),
      });
      const { payload, message } = await readResponsePayload(
        res,
        "Failed to update progress",
      );
      const taskPayload =
        payload &&
        typeof payload === "object" &&
        "task" in payload &&
        (payload as { task?: Task }).task
          ? (payload as { task: Task }).task
          : (payload as Task);
      return { task: taskPayload, message: message || undefined };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update progress";
      return rejectWithValue({ message });
    }
  },
);

export const logHours = createAsyncThunk<
  TaskThunkResult,
  {
    id: string;
    data: {
      date: string;
      hours: number;
      notes?: string;
      employee?: string;
      employeeId?: string;
      startTime?: string;
      endTime?: string;
    };
  },
  { rejectValue: TaskThunkError }
>(
  "tasks/logHours",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        date: string;
        hours: number;
        notes?: string;
        employee?: string;
        employeeId?: string;
        startTime?: string;
        endTime?: string;
      };
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`/api/tasks/${id}/hours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const { payload, message } = await readResponsePayload(
        res,
        "Failed to log hours",
      );
      const taskPayload =
        payload &&
        typeof payload === "object" &&
        "task" in payload &&
        (payload as { task?: Task }).task
          ? (payload as { task: Task }).task
          : (payload as Task);
      return { task: taskPayload, message: message || undefined };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to log hours";
      return rejectWithValue({ message });
    }
  },
);

export const addPhoto = createAsyncThunk<
  TaskThunkResult,
  { id: string; photoUrl: string; employee?: string; employeeId?: string },
  { rejectValue: TaskThunkError }
>(
  "tasks/addPhoto",
  async (
    {
      id,
      photoUrl,
      employee,
      employeeId,
    }: { id: string; photoUrl: string; employee?: string; employeeId?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`/api/tasks/${id}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: photoUrl, employee, employeeId }),
      });
      const { payload, message } = await readResponsePayload(
        res,
        "Failed to add photo",
      );
      const taskPayload =
        payload &&
        typeof payload === "object" &&
        "task" in payload &&
        (payload as { task?: Task }).task
          ? (payload as { task: Task }).task
          : (payload as Task);
      return { task: taskPayload, message: message || undefined };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add photo";
      return rejectWithValue({ message });
    }
  },
);

export const removePhoto = createAsyncThunk<
  TaskThunkResult,
  { id: string; photoUrl: string; employee?: string; employeeId?: string },
  { rejectValue: TaskThunkError }
>(
  "tasks/removePhoto",
  async (
    {
      id,
      photoUrl,
      employee,
      employeeId,
    }: { id: string; photoUrl: string; employee?: string; employeeId?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`/api/tasks/${id}/photos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: photoUrl, employee, employeeId }),
      });
      const { payload, message } = await readResponsePayload(
        res,
        "Failed to remove photo",
      );
      const taskPayload =
        payload &&
        typeof payload === "object" &&
        "task" in payload &&
        (payload as { task?: Task }).task
          ? (payload as { task: Task }).task
          : (payload as Task);
      return { task: taskPayload, message: message || undefined };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove photo";
      return rejectWithValue({ message });
    }
  },
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed";
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload.task);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (t) => t._id === action.payload.task._id,
        );
        if (idx !== -1) state.items[idx] = action.payload.task;
      })
      .addCase(updateTaskProgress.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (t) => t._id === action.payload.task._id,
        );
        if (idx !== -1) state.items[idx] = action.payload.task;
      })
      .addCase(logHours.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (t) => t._id === action.payload.task._id,
        );
        if (idx !== -1) state.items[idx] = action.payload.task;
      })
      .addCase(addPhoto.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (t) => t._id === action.payload.task._id,
        );
        if (idx !== -1) state.items[idx] = action.payload.task;
      })
      .addCase(removePhoto.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (t) => t._id === action.payload.task._id,
        );
        if (idx !== -1) state.items[idx] = action.payload.task;
      });
  },
});

export const { setFilter } = tasksSlice.actions;
export default tasksSlice.reducer;
