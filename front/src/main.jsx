import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/App.scss';

function initApp() {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (error) {
    // Без логирования ошибки
  }
}

// Запускаем приложение сразу
initApp();
