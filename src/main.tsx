import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/tokens.css';
import './styles/global.css';
import './styles/public.css';
import './styles/admin.css';
import './styles/identity.css';
import './styles/composition.css';
import './styles/access.css';
import './styles/api.css';
import './styles/client-scope.css';
import './styles/polish.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
