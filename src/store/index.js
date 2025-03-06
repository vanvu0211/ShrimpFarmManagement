// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';  // Import rootReducer đã được cập nhật

const store = configureStore({
  reducer: rootReducer,
});

export default store;
