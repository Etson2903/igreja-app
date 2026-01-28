import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import EntityForm from './EntityForm';
import DataTable from './DataTable';

const newsFields = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'summary', label: 'Resumo Curto', type: 'textarea', rows: 2, placeholder: 'Texto que aparece na lista...' },
  { name: 'content', label: 'Conteúdo Completo', type: 'textarea', rows: 8, required: true },
  { name: 'category', label: 'Categoria', type: 'select', options: [{value:'noticia',label:'Notícia'},{value:'aviso',label:'Aviso'},{value:'devocional',label:'Devocional'}] },
  { name: 'image_url', label: 'Capa', type: 'image' },
  { name: 'author', label: 'Autor', type: 'text' },
  { name: 'is_highlighted', label: 'Destaque?', type: 'boolean', defaultValue: false },
  { name: 'is_published', label: 'Publicar Agora', type: 'boolean', defaultValue: true },
];

// Função segura para formatar data
const formatDateSafe = (dateString) => {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), "d 'de' MMM, yyyy", { locale: ptBR });
  } catch (e) {
    return '-';
  }
};

export default function AdminNews() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: news = [] } = useQuery({ 
    queryKey: ['news'], 
    queryFn: async () => {
      const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const { id, created_at, ...payload } = data;
      if (id) {
        const { error } = await supabase.from('news').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('news').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['news'] }); toast.success('Salvo!'); setFormOpen(false); },
    onError: (err) => toast.error('Erro: ' + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['news'] }); toast.success('Removido!'); }
  });

  const columns = [
    { key: 'title', label: 'Notícia', render: (item) => <div className="flex items-center gap-3">{item.image_url ? <img src={item.image_url} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center"><Newspaper className="w-5 h-5 text-blue-500" /></div>}<div className="min-w-0"><p className="font-medium truncate">{item.title}</p><p className="text-xs text-gray-500 truncate">{item.summary}</p></div></div> },
    { key: 'created_at', label: 'Data', render: (item) => formatDateSafe(item.created_at) },
    { key: 'category', label: 'Categoria', render: (item) => <Badge variant="outline">{item.category}</Badge> },
    { key: 'is_published', label: 'Status', render: (item) => <Badge variant={item.is_published ? 'default' : 'secondary'}>{item.is_published ? 'Publicado' : 'Rascunho'}</Badge> }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-gray-500">{news.length} notícias</p><Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button></div>
      <DataTable columns={columns} data={news} onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} onDelete={(id) => deleteMutation.mutate(id)} onToggleActive={(item) => saveMutation.mutate({...item, is_published: !item.is_published})} emptyIcon={Newspaper} />
      <EntityForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={(data) => saveMutation.mutate(data)} fields={newsFields} initialData={editingItem} title={editingItem ? 'Editar' : 'Nova'} isSaving={saveMutation.isPending} />
    </div>
  );
}
