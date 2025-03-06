import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';  // Đảm bảo rootReducer tồn tại và đúng đường dẫn

const store = configureStore({
  reducer: rootReducer,  // Thêm reducers vào đây nếu cần
});

export default store;  // Đảm bảo bạn export store mặc định
