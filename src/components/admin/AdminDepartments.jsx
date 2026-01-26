import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EntityForm from './EntityForm';
import DataTable from './DataTable';

const departmentFields = [
  { name: 'name', label: 'Nome', type: 'text', required: true },
  { name: 'description', label: 'Descrição', type: 'textarea' },
  { name: 'photo_url', label: 'Foto', type: 'image' },
  { name: 'leader_name', label: 'Líder', type: 'text' },
  { name: 'meeting_day', label: 'Dia de Reunião', type: 'text' },
  { name: 'is_active', label: 'Status', type: 'boolean', defaultValue: true },
];

export default function AdminDepartments() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: () => base44.entities.Department.list('order', 100) });

  const createMutation = useMutation({ mutationFn: (data) => base44.entities.Department.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); toast.success('Adicionado!'); setFormOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.Department.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); toast.success('Atualizado!'); setFormOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: (id) => base44.entities.Department.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); toast.success('Removido!'); } });

  const columns = [
    { key: 'name', label: 'Departamento', render: (item) => <div className="flex items-center gap-3">{item.photo_url ? <img src={item.photo_url} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center"><Building2 className="w-5 h-5 text-indigo-500" /></div>}<div><p className="font-medium">{item.name}</p><p className="text-sm text-gray-500">{item.leader_name}</p></div></div> },
    { key: 'meeting_day', label: 'Reunião', render: (item) => item.meeting_day || '-' },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Ativo' : 'Inativo'}</Badge> }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-gray-500">{departments.length} departamentos</p><Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button></div>
      <DataTable columns={columns} data={departments} onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} onDelete={(id) => deleteMutation.mutate(id)} onToggleActive={(item) => updateMutation.mutate({id: item.id, data: {is_active: !item.is_active}})} emptyIcon={Building2} />
      <EntityForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={(data) => editingItem ? updateMutation.mutate({id: editingItem.id, data}) : createMutation.mutate(data)} fields={departmentFields} initialData={editingItem} title={editingItem ? 'Editar' : 'Novo'} isSaving={createMutation.isPending || updateMutation.isPending} />
    </div>
  );
}
