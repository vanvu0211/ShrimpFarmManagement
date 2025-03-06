import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // server: {
  //   host: '103.170.122.142', 
  //   port: 81,               
  // },
});
