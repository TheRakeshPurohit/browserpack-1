import React from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import 'vscode-codicons/dist/codicon.css';
import App from './app';
import ReactDOM from 'react-dom';
import './reportWebVitals';
import { useStore } from './store';

const GlobalStyle = createGlobalStyle`
  body {
    padding: 0;
    margin: 0;
    font-family: Inter, Roboto, sans-serif;
  }

  .Resizer {
    z-index: 1;
  }

  .Resizer:hover {
    -webkit-transition: all 2s ease;
    transition: all 2s ease;
  }

  .Resizer.horizontal {
    height: 8px;
    margin: -5px 0;
    cursor: row-resize;
    width: 100%;
  }

  .Resizer.vertical {
    width: 8px;
    margin: 0 -5px;
    cursor: col-resize;
  }

  .Resizer.disabled {
    cursor: not-allowed;
  }

  .Resizer.disabled:hover {
    border-color: transparent;
  }
`;

function Index() {
  const theme = useStore((state) => state.theme);

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}

ReactDOM.render(<Index />, document.getElementById('root'));
