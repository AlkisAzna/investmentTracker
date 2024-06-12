import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import App from "./App";
import { ThemeWorker } from './header/ThemeContext';
import theme from './App';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeWorker theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeWorker>
  </React.StrictMode>
);

reportWebVitals();
