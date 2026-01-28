import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EntityForm from './EntityForm';
import DataTable from './DataTable';

const congregationFields = [
  { name: 'name', label: 'Nome da Congregação', type: 'text', required: true, placeholder: 'Ex: Sede, Filial 1...' },
  { name: 'address', label: 'Endereço Completo', type: 'text', required: true },
  { name: 'neighborhood', label: 'Bairro', type: 'text' },
  { name: 'city', label: 'Cidade', type: 'text', required: true },
  { name: 'state', label: 'Estado (UF)', type: 'text', placeholder: 'SC' },
  { name: 'pastor_name', label: 'Nome do Pastor Responsável', type: 'text' },
  { name: 'pastor_phone', label: 'Telefone/Zap do Pastor', type: 'text' },
  { name: 'service_times', label: 'Horários de Culto', type: 'text', placeholder: 'Ex: Domingo 19h, Terça 19:30h' },
  { name: 'latitude', label: 'Latitude (Google Maps)', type: 'number', step: '0.000001', placeholder: 'Ex: -26.3045' },
  { name: 'longitude', label: 'Longitude (Google Maps)', type: 'number', step: '0.000001', placeholder: 'Ex: -48.8487' },
  { name: 'photo_url', label: 'Foto da Fachada', type: 'image' },
  { name: 'is_active', label: 'Status', type: 'boolean', defaultValue: true },
];

export default function AdminCongregations() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: congregations = [] } = useQuery({ 
    queryKey: ['congregations'], 
    queryFn: async () => {
      const { data, error } = await supabase.from('congregations').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const { id, created_at, ...payload } = data;
      if (id) {
        const { error } = await supabase.from('congregations').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('congregations').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['congregations'] }); toast.success('Salvo!'); setFormOpen(false); },
    onError: (err) => toast.error('Erro: ' + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('congregations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['congregations'] }); toast.success('Removido!'); }
  });

  const columns = [
    { key: 'name', label: 'Congregação', render: (item) => <div className="flex items-center gap-3">{item.photo_url ? <img src={item.photo_url} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><MapPin className="w-5 h-5 text-amber-500" /></div>}<div><p className="font-medium">{item.name}</p><p className="text-sm text-gray-500">{item.neighborhood} - {item.city}</p></div></div> },
    { key: 'pastor_name', label: 'Pastor', render: (item) => item.pastor_name || '-' },
    { key: 'service_times', label: 'Cultos', render: (item) => <span className="text-xs text-gray-600">{item.service_times || '-'}</span> },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Ativa' : 'Inativa'}</Badge> }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-gray-500">{congregations.length} congregações</p><Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button></div>
      <DataTable columns={columns} data={congregations} onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} onDelete={(id) => deleteMutation.mutate(id)} onToggleActive={(item) => saveMutation.mutate({...item, is_active: !item.is_active})} emptyIcon={MapPin} />
      <EntityForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={(data) => saveMutation.mutate(data)} fields={congregationFields} initialData={editingItem} title={editingItem ? 'Editar' : 'Nova'} isSaving={saveMutation.isPending} />
    </div>
  );
}
