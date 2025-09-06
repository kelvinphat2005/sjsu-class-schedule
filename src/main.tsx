import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route } from "react-router-dom";
import { Routes } from 'react-router-dom';

import './index.css'
import App from './App.tsx'
import ClassPage from './components/ClassPage.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<div className="text-neutral-300">Select a class</div>} />
          <Route path="class/:id" element={<ClassPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
