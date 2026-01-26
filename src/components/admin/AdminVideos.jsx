import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EntityForm from './EntityForm';
import DataTable from './DataTable';

const videoFields = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'youtube_video_id', label: 'ID YouTube', type: 'text', required: true, placeholder: 'Ex: dQw4w9WgXcQ' },
  { name: 'category', label: 'Categoria', type: 'select', options: [{value:'pregacao',label:'Pregação'},{value:'louvor',label:'Louvor'},{value:'live',label:'Ao Vivo'}] },
  { name: 'preacher', label: 'Pregador', type: 'text' },
  { name: 'is_live', label: 'Ao Vivo Agora', type: 'boolean', defaultValue: false },
  { name: 'is_active', label: 'Status', type: 'boolean', defaultValue: true },
];

export default function AdminVideos() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: videos = [] } = useQuery({ queryKey: ['videos'], queryFn: () => base44.entities.Video.list('-created_date', 100) });

  const createMutation = useMutation({ mutationFn: (data) => base44.entities.Video.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['videos'] }); toast.success('Adicionado!'); setFormOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.Video.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['videos'] }); toast.success('Atualizado!'); setFormOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: (id) => base44.entities.Video.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['videos'] }); toast.success('Removido!'); } });

  const columns = [
    { key: 'title', label: 'Vídeo', render: (item) => <div className="flex items-center gap-3"><img src={`https://img.youtube.com/vi/${item.youtube_video_id}/mqdefault.jpg`} className="w-16 h-10 rounded object-cover" /><p className="font-medium">{item.title}</p></div> },
    { key: 'category', label: 'Categoria', render: (item) => <Badge variant="outline">{item.category}</Badge> },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Ativo' : 'Inativo'}</Badge> }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-gray-500">{videos.length} vídeos</p><Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button></div>
      <DataTable columns={columns} data={videos} onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} onDelete={(id) => deleteMutation.mutate(id)} onToggleActive={(item) => updateMutation.mutate({id: item.id, data: {is_active: !item.is_active}})} emptyIcon={Play} />
      <EntityForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={(data) => editingItem ? updateMutation.mutate({id: editingItem.id, data}) : createMutation.mutate(data)} fields={videoFields} initialData={editingItem} title={editingItem ? 'Editar' : 'Novo'} isSaving={createMutation.isPending || updateMutation.isPending} />
    </div>
  );
}
