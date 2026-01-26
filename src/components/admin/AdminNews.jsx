import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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
  { name: 'content', label: 'Conteúdo', type: 'textarea', rows: 8, required: true },
  { name: 'category', label: 'Categoria', type: 'select', options: [{value:'noticia',label:'Notícia'},{value:'aviso',label:'Aviso'},{value:'devocional',label:'Devocional'}] },
  { name: 'image_url', label: 'Capa', type: 'image' },
  { name: 'is_published', label: 'Publicar', type: 'boolean', defaultValue: true },
];

export default function AdminNews() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: news = [] } = useQuery({ queryKey: ['news'], queryFn: () => base44.entities.News.list('-created_date', 100) });

  const createMutation = useMutation({ mutationFn: (data) => base44.entities.News.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['news'] }); toast.success('Adicionado!'); setFormOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.News.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['news'] }); toast.success('Atualizado!'); setFormOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: (id) => base44.entities.News.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['news'] }); toast.success('Removido!'); } });

  const columns = [
    { key: 'title', label: 'Notícia', render: (item) => <div className="flex items-center gap-3">{item.image_url ? <img src={item.image_url} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center"><Newspaper className="w-5 h-5 text-blue-500" /></div>}<p className="font-medium truncate">{item.title}</p></div> },
    { key: 'created_date', label: 'Data', render: (item) => format(parseISO(item.created_date), "d 'de' MMM", { locale: ptBR }) },
    { key: 'is_published', label: 'Status', render: (item) => <Badge variant={item.is_published ? 'default' : 'secondary'}>{item.is_published ? 'Publicado' : 'Rascunho'}</Badge> }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-gray-500">{news.length} notícias</p><Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button></div>
      <DataTable columns={columns} data={news} onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} onDelete={(id) => deleteMutation.mutate(id)} onToggleActive={(item) => updateMutation.mutate({id: item.id, data: {is_published: !item.is_published}})} emptyIcon={Newspaper} />
      <EntityForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={(data) => editingItem ? updateMutation.mutate({id: editingItem.id, data}) : createMutation.mutate(data)} fields={newsFields} initialData={editingItem} title={editingItem ? 'Editar' : 'Nova'} isSaving={createMutation.isPending || updateMutation.isPending} />
    </div>
  );
}
