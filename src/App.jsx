import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import Home from './pages/Home';
import Agenda from './pages/Agenda';
import AoVivo from './pages/AoVivo';
import Ofertas from './pages/Ofertas';
import Lideranca from './pages/Lideranca';
import Departamentos from './pages/Departamentos';
import Congregacoes from './pages/Congregacoes';
import Noticias from './pages/Noticias';
import NoticiaDetalhe from './pages/NoticiaDetalhe';
import Conteudo from './pages/Conteudo';
import Admin from './components/admin/Admin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/aovivo" element={<AoVivo />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/lideranca" element={<Lideranca />} />
          <Route path="/departamentos" element={<Departamentos />} />
          <Route path="/congregacoes" element={<Congregacoes />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticia/:id" element={<NoticiaDetalhe />} />
          <Route path="/conteudo" element={<Conteudo />} />
          
          {/* Rota Administrativa */}
          <Route path="/admin" element={<Admin />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
