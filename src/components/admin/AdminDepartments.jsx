import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EntityForm from './EntityForm';
import DataTable from './DataTable';

const departmentFields = [
  { name: 'name', label: 'Nome do Departamento', type: 'text', required: true },
  { name: 'description', label: 'Descrição / Propósito', type: 'textarea' },
  { name: 'photo_url', label: 'Foto / Logo', type: 'image' },
  { name: 'leader_name', label: 'Líder Responsável', type: 'text' },
  { name: 'meeting_day', label: 'Dia de Reunião', type: 'text', placeholder: 'Ex: Sábados' },
  { name: 'meeting_time', label: 'Horário', type: 'text', placeholder: 'Ex: 19:30' },
  { name: 'display_order', label: 'Ordem de Exibição', type: 'number', defaultValue: 1 },
  { name: 'is_active', label: 'Status', type: 'boolean', defaultValue: true },
];

export default function AdminDepartments() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: departments = [] } = useQuery({ 
    queryKey: ['departments'], 
    queryFn: async () => {
      const { data, error } = await supabase.from('departments').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const { id, created_at, ...payload } = data;
      if (id) {
        const { error } = await supabase.from('departments').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('departments').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); toast.success('Salvo!'); setFormOpen(false); },
    onError: (err) => toast.error('Erro: ' + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); toast.success('Removido!'); }
  });

  const columns = [
    { key: 'name', label: 'Departamento', render: (item) => <div className="flex items-center gap-3">{item.photo_url ? <img src={item.photo_url} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center"><Building2 className="w-5 h-5 text-indigo-500" /></div>}<div><p className="font-medium">{item.name}</p><p className="text-sm text-gray-500">{item.leader_name}</p></div></div> },
    { key: 'meeting_day', label: 'Reunião', render: (item) => item.meeting_day ? `${item.meeting_day} ${item.meeting_time || ''}` : '-' },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Ativo' : 'Inativo'}</Badge> }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-gray-500">{departments.length} departamentos</p><Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button></div>
      <DataTable columns={columns} data={departments} onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} onDelete={(id) => deleteMutation.mutate(id)} onToggleActive={(item) => saveMutation.mutate({...item, is_active: !item.is_active})} emptyIcon={Building2} />
      <EntityForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={(data) => saveMutation.mutate(data)} fields={departmentFields} initialData={editingItem} title={editingItem ? 'Editar' : 'Novo'} isSaving={saveMutation.isPending} />
    </div>
  );
}
