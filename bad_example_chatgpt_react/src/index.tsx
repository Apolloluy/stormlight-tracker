import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import CosmereEncounterTrackerApp from './cosmere_encounter_tracker_react_mui'
import { BrowserRouter, Routes, Route } from "react-router";

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
    <CosmereEncounterTrackerApp/>
  </React.StrictMode>
);