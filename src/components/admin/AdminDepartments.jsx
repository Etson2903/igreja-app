import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, Building2, User, Clock, AlertCircle } from 'lucide-react';
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
  { name: 'is_active', label: 'Status', type: 'boolean', defaultValue: true },
];

export default function AdminDepartments() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // QUERY MELHORADA COM LOGS DE DEBUG
  const { data: departments = [], isLoading, isError, error } = useQuery({ 
    queryKey: ['departments'], 
    queryFn: async () => {
      console.log("🔄 Buscando departamentos...");
      
      // Tenta buscar ordenado. Se falhar, o catch pega.
      // Se a coluna display_order não existir, isso pode ser o problema.
      // Vamos tentar buscar SEM ordem primeiro para garantir que dados apareçam.
      
      const { data, error } = await supabase
        .from('departments')
        .select('*');
        // .order('display_order', { ascending: true }); // Comentei temporariamente para teste

      if (error) {
        console.error("❌ Erro Supabase:", error);
        throw error;
      }
      
      console.log("✅ Dados recebidos:", data);
      
      // Ordenação manual no front-end para evitar erro de coluna inexistente
      return data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
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
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['departments'] }); 
      toast.success('Salvo com sucesso!'); 
      setFormOpen(false); 
    },
    onError: (err) => toast.error('Erro ao salvar: ' + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['departments'] }); 
      toast.success('Departamento removido!'); 
    }
  });

  const columns = [
    { 
      key: 'name', 
      label: 'Departamento', 
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.photo_url ? (
            <img src={item.photo_url} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-500" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{item.name}</p>
            {item.leader_name && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <User className="w-3 h-3" /> {item.leader_name}
              </p>
            )}
          </div>
        </div>
      ) 
    },
    { 
      key: 'meeting_day', 
      label: 'Reunião', 
      render: (item) => (
        <div className="text-sm text-gray-600">
          {item.meeting_day ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {item.meeting_day} {item.meeting_time && `- ${item.meeting_time}`}
            </span>
          ) : '-'}
        </div>
      ) 
    },
    { 
      key: 'is_active', 
      label: 'Status', 
      render: (item) => (
        <Badge variant={item.is_active ? 'default' : 'secondary'} className={item.is_active ? "bg-green-500 hover:bg-green-600" : ""}>
          {item.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      ) 
    }
  ];

  if (isLoading) return <div className="p-8 text-center text-gray-500">Carregando departamentos...</div>;

  if (isError) return (
    <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
      <AlertCircle className="w-5 h-5" />
      Erro ao carregar dados: {error.message}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Departamentos</h2>
          <p className="text-sm text-gray-500">{departments.length} cadastrados</p>
        </div>
        <Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Departamento
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={departments} 
        onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} 
        onDelete={(id) => deleteMutation.mutate(id)} 
        onToggleActive={(item) => saveMutation.mutate({...item, is_active: !item.is_active})} 
        emptyIcon={Building2} 
      />

      <EntityForm 
        isOpen={formOpen} 
        onClose={() => setFormOpen(false)} 
        onSave={(data) => saveMutation.mutate(data)} 
        fields={departmentFields} 
        initialData={editingItem} 
        title={editingItem ? 'Editar Departamento' : 'Novo Departamento'} 
        isSaving={saveMutation.isPending} 
      />
    </div>
  );
}