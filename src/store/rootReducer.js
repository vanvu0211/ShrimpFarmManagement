// store/rootReducer.js
import { combineReducers } from 'redux';
import sidebarReducer from './sidebarSlice';  // Import slice quản lý sidebar

const rootReducer = combineReducers({
  sidebar: sidebarReducer,  
});

export default rootReducer;
