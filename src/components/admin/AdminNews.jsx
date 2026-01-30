import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, Newspaper, AlertCircle } from 'lucide-react';
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
  { 
    name: 'category', 
    label: 'Categoria', 
    type: 'select', 
    options: [
      {value:'noticia',label:'Notícia'},
      {value:'aviso',label:'Aviso'},
      {value:'devocional',label:'Devocional'},
      {value:'estudo',label:'Estudo'},
      {value:'comunicado',label:'Comunicado'}
    ] 
  },
  { name: 'image_url', label: 'Capa', type: 'image' },
  { name: 'author', label: 'Autor', type: 'text' },
  { name: 'created_date', label: 'Data da Publicação', type: 'date' }, // Adicionei campo de data
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

  const { data: news = [], isLoading, isError, error } = useQuery({ 
    queryKey: ['news'], 
    queryFn: async () => {
      // Ordena por created_date (data editorial) em vez de created_at (data sistema)
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const { id, created_at, ...payload } = data;
      
      // Garante que created_date tenha valor se não vier do form
      if (!payload.created_date) {
        payload.created_date = new Date().toISOString();
      }

      if (id) {
        const { error } = await supabase.from('news').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('news').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['news'] }); 
      toast.success('Notícia salva com sucesso!'); 
      setFormOpen(false); 
    },
    onError: (err) => toast.error('Erro ao salvar: ' + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['news'] }); 
      toast.success('Notícia removida!'); 
    }
  });

  const columns = [
    { 
      key: 'title', 
      label: 'Notícia', 
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img src={item.image_url} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-blue-500" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium truncate text-gray-900">{item.title}</p>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.summary}</p>
          </div>
        </div>
      ) 
    },
    { 
      key: 'created_date', 
      label: 'Data', 
      render: (item) => formatDateSafe(item.created_date) 
    },
    { 
      key: 'category', 
      label: 'Categoria', 
      render: (item) => <Badge variant="outline" className="capitalize">{item.category}</Badge> 
    },
    { 
      key: 'is_published', 
      label: 'Status', 
      render: (item) => (
        <Badge variant={item.is_published ? 'default' : 'secondary'} className={item.is_published ? "bg-green-500 hover:bg-green-600" : ""}>
          {item.is_published ? 'Publicado' : 'Rascunho'}
        </Badge>
      ) 
    }
  ];

  if (isLoading) return <div className="p-8 text-center text-gray-500">Carregando notícias...</div>;
  if (isError) return <div className="p-4 bg-red-50 text-red-600 rounded-lg flex gap-2"><AlertCircle className="w-5 h-5"/> Erro: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gerenciar Notícias</h2>
          <p className="text-sm text-gray-500">{news.length} itens cadastrados</p>
        </div>
        <Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Nova Notícia
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={news} 
        onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} 
        onDelete={(id) => deleteMutation.mutate(id)} 
        onToggleActive={(item) => saveMutation.mutate({...item, is_published: !item.is_published})} 
        emptyIcon={Newspaper} 
      />

      <EntityForm 
        isOpen={formOpen} 
        onClose={() => setFormOpen(false)} 
        onSave={(data) => saveMutation.mutate(data)} 
        fields={newsFields} 
        initialData={editingItem} 
        title={editingItem ? 'Editar Notícia' : 'Nova Notícia'} 
        isSaving={saveMutation.isPending} 
      />
    </div>
  );
}