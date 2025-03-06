// store/sidebarSlice.js
import { createSlice } from '@reduxjs/toolkit';

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: {
    expanded: true,  // Trạng thái mặc định là mở rộng
  },
  reducers: {
    toggleSidebar: (state) => {
      state.expanded = !state.expanded;
    },
    setExpanded: (state, action) => {
      state.expanded = action.payload;
    },
  },
});

export const { toggleSidebar, setExpanded } = sidebarSlice.actions;

export default sidebarSlice.reducer;
