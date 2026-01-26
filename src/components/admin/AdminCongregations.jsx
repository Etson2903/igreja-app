import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EntityForm from './EntityForm';
import DataTable from './DataTable';

const congregationFields = [
  { name: 'name', label: 'Nome', type: 'text', required: true },
  { name: 'address', label: 'Endereço', type: 'text', required: true },
  { name: 'city', label: 'Cidade', type: 'text' },
  { name: 'pastor_name', label: 'Pastor', type: 'text' },
  { name: 'photo_url', label: 'Foto', type: 'image' },
  { name: 'is_active', label: 'Status', type: 'boolean', defaultValue: true },
];

export default function AdminCongregations() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: congregations = [] } = useQuery({ queryKey: ['congregations'], queryFn: () => base44.entities.Congregation.list('name', 100) });

  const createMutation = useMutation({ mutationFn: (data) => base44.entities.Congregation.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['congregations'] }); toast.success('Adicionado!'); setFormOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.Congregation.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['congregations'] }); toast.success('Atualizado!'); setFormOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: (id) => base44.entities.Congregation.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['congregations'] }); toast.success('Removido!'); } });

  const columns = [
    { key: 'name', label: 'Congregação', render: (item) => <div className="flex items-center gap-3">{item.photo_url ? <img src={item.photo_url} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><MapPin className="w-5 h-5 text-amber-500" /></div>}<div><p className="font-medium">{item.name}</p><p className="text-sm text-gray-500">{item.city}</p></div></div> },
    { key: 'pastor_name', label: 'Pastor', render: (item) => item.pastor_name || '-' },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Ativa' : 'Inativa'}</Badge> }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-gray-500">{congregations.length} congregações</p><Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button></div>
      <DataTable columns={columns} data={congregations} onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} onDelete={(id) => deleteMutation.mutate(id)} onToggleActive={(item) => updateMutation.mutate({id: item.id, data: {is_active: !item.is_active}})} emptyIcon={MapPin} />
      <EntityForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={(data) => editingItem ? updateMutation.mutate({id: editingItem.id, data}) : createMutation.mutate(data)} fields={congregationFields} initialData={editingItem} title={editingItem ? 'Editar' : 'Nova'} isSaving={createMutation.isPending || updateMutation.isPending} />
    </div>
  );
}
