import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EntityForm from './EntityForm';
import DataTable from './DataTable';

const leaderFields = [
  { name: 'name', label: 'Nome Completo', type: 'text', required: true },
  { name: 'role', label: 'Cargo', type: 'text', required: true },
  { name: 'leader_type', label: 'Tipo', type: 'select', required: true, options: [{value:'diretoria',label:'Diretoria'},{value:'pastor',label:'Pastor'},{value:'lider_departamento',label:'Líder Dept.'}] },
  { name: 'photo_url', label: 'Foto', type: 'image' },
  { name: 'bio', label: 'Biografia', type: 'textarea' },
  { name: 'phone', label: 'Telefone', type: 'text' },
  { name: 'is_active', label: 'Status', type: 'boolean', defaultValue: true },
];

export default function AdminLeaders() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: leaders = [] } = useQuery({ queryKey: ['leaders'], queryFn: () => base44.entities.Leader.list('-created_date', 100) });

  const createMutation = useMutation({ mutationFn: (data) => base44.entities.Leader.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaders'] }); toast.success('Líder adicionado!'); setFormOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.Leader.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaders'] }); toast.success('Líder atualizado!'); setFormOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: (id) => base44.entities.Leader.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaders'] }); toast.success('Líder removido!'); } });

  const columns = [
    { key: 'name', label: 'Nome', render: (item) => <div className="flex items-center gap-3">{item.photo_url ? <img src={item.photo_url} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><Users className="w-5 h-5 text-gray-400" /></div>}<div><p className="font-medium">{item.name}</p><p className="text-sm text-gray-500">{item.role}</p></div></div> },
    { key: 'leader_type', label: 'Tipo', render: (item) => <Badge variant="outline">{item.leader_type}</Badge> },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Ativo' : 'Inativo'}</Badge> }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-gray-500">{leaders.length} líderes</p><Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button></div>
      <DataTable columns={columns} data={leaders} onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} onDelete={(id) => deleteMutation.mutate(id)} onToggleActive={(item) => updateMutation.mutate({id: item.id, data: {is_active: !item.is_active}})} emptyIcon={Users} />
      <EntityForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={(data) => editingItem ? updateMutation.mutate({id: editingItem.id, data}) : createMutation.mutate(data)} fields={leaderFields} initialData={editingItem} title={editingItem ? 'Editar Líder' : 'Novo Líder'} isSaving={createMutation.isPending || updateMutation.isPending} />
    </div>
  );
}
