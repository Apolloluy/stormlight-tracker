import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from "react-router";
import { Encounter } from './pages/encounter/Encounter';
import { NavAppBar } from './components/header/NavBar';
import { StormlightTheme } from './Theme';


import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);





root.render(
  <React.StrictMode>
    <BrowserRouter>
    <ThemeProvider theme={StormlightTheme}>
        <CssBaseline enableColorScheme/>
        <NavAppBar/>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/encounters" element={<Encounter />} 
            />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
