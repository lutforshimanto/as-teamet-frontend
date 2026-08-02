import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';
import usersReducer from './slices/usersSlice';
import clientsReducer from './slices/clientsSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      tasks: tasksReducer,
      users: usersReducer,
      clients: clientsReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
