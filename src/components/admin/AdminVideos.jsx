import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EntityForm from './EntityForm';
import DataTable from './DataTable';

const videoFields = [
  { name: 'title', label: 'Título do Vídeo', type: 'text', required: true },
  { name: 'youtube_video_id', label: 'ID do YouTube', type: 'text', required: true, placeholder: 'Ex: dQw4w9WgXcQ (parte final da URL)' },
  { name: 'description', label: 'Descrição', type: 'textarea' },
  { name: 'category', label: 'Categoria', type: 'select', options: [{value:'pregacao',label:'Pregação'},{value:'louvor',label:'Louvor'},{value:'estudo',label:'Estudo Bíblico'},{value:'live',label:'Transmissão Ao Vivo'}] },
  { name: 'preacher', label: 'Pregador / Cantor', type: 'text' },
  { name: 'event_date', label: 'Data do Evento', type: 'date' },
  { name: 'duration', label: 'Duração', type: 'text', placeholder: 'Ex: 1h 30m' },
  { name: 'is_live', label: 'Está Ao Vivo Agora?', type: 'boolean', defaultValue: false },
  { name: 'is_featured', label: 'Destaque?', type: 'boolean', defaultValue: false },
  { name: 'is_active', label: 'Ativo', type: 'boolean', defaultValue: true },
];

export default function AdminVideos() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: videos = [] } = useQuery({ 
    queryKey: ['videos'], 
    queryFn: async () => {
      const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const { id, created_at, ...payload } = data;
      if (id) {
        const { error } = await supabase.from('videos').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('videos').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['videos'] }); toast.success('Salvo!'); setFormOpen(false); },
    onError: (err) => toast.error('Erro: ' + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['videos'] }); toast.success('Removido!'); }
  });

  const columns = [
    { key: 'title', label: 'Vídeo', render: (item) => <div className="flex items-center gap-3"><img src={`https://img.youtube.com/vi/${item.youtube_video_id}/mqdefault.jpg`} className="w-16 h-10 rounded object-cover" /><div><p className="font-medium">{item.title}</p><p className="text-xs text-gray-500">{item.preacher}</p></div></div> },
    { key: 'category', label: 'Categoria', render: (item) => <Badge variant="outline">{item.category}</Badge> },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Ativo' : 'Inativo'}</Badge> }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-gray-500">{videos.length} vídeos</p><Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button></div>
      <DataTable columns={columns} data={videos} onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} onDelete={(id) => deleteMutation.mutate(id)} onToggleActive={(item) => saveMutation.mutate({...item, is_active: !item.is_active})} emptyIcon={Play} />
      <EntityForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={(data) => saveMutation.mutate(data)} fields={videoFields} initialData={editingItem} title={editingItem ? 'Editar' : 'Novo'} isSaving={saveMutation.isPending} />
    </div>
  );
}
