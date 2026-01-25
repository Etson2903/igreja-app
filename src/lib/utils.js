import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function createPageUrl(pageName) {
  const routes = {
    'Home': '/',
    'Agenda': '/agenda',
    'AoVivo': '/ao-vivo',
    'Ofertas': '/ofertas',
    'Lideranca': '/lideranca',
    'Congregacoes': '/congregacoes',
    'Departamentos': '/departamentos',
    'Noticias': '/noticias',
    'NoticiaDetalhe': '/noticia-detalhe',
    'Conteudo': '/conteudo',
  };
  return routes[pageName] || '/';
}
