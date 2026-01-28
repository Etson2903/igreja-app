import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EntityForm from './EntityForm';
import DataTable from './DataTable';

const leaderFields = [
  { name: 'name', label: 'Nome Completo', type: 'text', required: true },
  { name: 'role', label: 'Cargo / Função', type: 'text', required: true, placeholder: 'Ex: Pastor Presidente, Líder de Jovens' },
  { name: 'leader_type', label: 'Categoria', type: 'select', required: true, options: [{value:'diretoria',label:'Diretoria / Pastor'},{value:'lider_departamento',label:'Líder de Departamento'},{value:'obreiro',label:'Obreiro'}] },
  { name: 'photo_url', label: 'Foto de Perfil', type: 'image' },
  { name: 'bio', label: 'Biografia / Sobre', type: 'textarea', rows: 4 },
  { name: 'phone', label: 'Telefone', type: 'text' },
  { name: 'whatsapp', label: 'WhatsApp (Link ou Número)', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'display_order', label: 'Ordem de Exibição', type: 'number', defaultValue: 1, description: 'Menor número aparece primeiro' },
  { name: 'is_active', label: 'Status', type: 'boolean', defaultValue: true },
];

export default function AdminLeaders() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: leaders = [] } = useQuery({ 
    queryKey: ['leaders'], 
    queryFn: async () => {
      const { data, error } = await supabase.from('leaders').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const { id, created_at, ...payload } = data;
      if (id) {
        const { error } = await supabase.from('leaders').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('leaders').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaders'] }); toast.success('Salvo!'); setFormOpen(false); },
    onError: (err) => toast.error('Erro: ' + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('leaders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaders'] }); toast.success('Removido!'); }
  });

  const columns = [
    { key: 'name', label: 'Nome', render: (item) => <div className="flex items-center gap-3">{item.photo_url ? <img src={item.photo_url} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><Users className="w-5 h-5 text-gray-400" /></div>}<div><p className="font-medium">{item.name}</p><p className="text-sm text-gray-500">{item.role}</p></div></div> },
    { key: 'leader_type', label: 'Tipo', render: (item) => <Badge variant="outline">{item.leader_type}</Badge> },
    { key: 'display_order', label: 'Ordem', render: (item) => item.display_order },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Ativo' : 'Inativo'}</Badge> }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-gray-500">{leaders.length} líderes</p><Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button></div>
      <DataTable columns={columns} data={leaders} onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} onDelete={(id) => deleteMutation.mutate(id)} onToggleActive={(item) => saveMutation.mutate({...item, is_active: !item.is_active})} emptyIcon={Users} />
      <EntityForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={(data) => saveMutation.mutate(data)} fields={leaderFields} initialData={editingItem} title={editingItem ? 'Editar Líder' : 'Novo Líder'} isSaving={saveMutation.isPending} />
    </div>
  );
}
