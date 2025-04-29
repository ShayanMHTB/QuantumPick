import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import { Toaster } from './components/ui/sonner';

// Import global styles
import './index.css';

// Import i18n configuration (must be imported before other components that use translations)
import './i18n';

// Import router and store
import router from './router/MainRouter';
import store from './store';

// Create root and render app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </Provider>
  </StrictMode>,
);
