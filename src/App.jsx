import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import Layout from '@/components/layout/Layout';

// Importação das Páginas
import Home from '@/pages/Home';
import Agenda from '@/pages/Agenda';
import AoVivo from '@/pages/AoVivo';
import Ofertas from '@/pages/Ofertas';
import Lideranca from '@/pages/Lideranca';
import Congregacoes from '@/pages/Congregacoes';
import Departamentos from '@/pages/Departamentos';
import Noticias from '@/pages/Noticias';
import NoticiaDetalhe from '@/pages/NoticiaDetalhe';
import Conteudo from '@/pages/Conteudo';

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  
  const getCurrentPageName = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path.startsWith('/agenda')) return 'Agenda';
    if (path.startsWith('/ao-vivo')) return 'AoVivo';
    if (path.startsWith('/ofertas')) return 'Ofertas';
    if (path.startsWith('/lideranca')) return 'Lideranca';
    if (path.startsWith('/congregacoes')) return 'Congregacoes';
    if (path.startsWith('/departamentos')) return 'Departamentos';
    if (path.startsWith('/noticias')) return 'Noticias';
    if (path.startsWith('/conteudo')) return 'Conteudo';
    return '';
  };

  return (
    <Layout currentPageName={getCurrentPageName()}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/ao-vivo" element={<AoVivo />} />
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/lideranca" element={<Lideranca />} />
        <Route path="/congregacoes" element={<Congregacoes />} />
        <Route path="/departamentos" element={<Departamentos />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/noticia-detalhe" element={<NoticiaDetalhe />} />
        <Route path="/conteudo" element={<Conteudo />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}
