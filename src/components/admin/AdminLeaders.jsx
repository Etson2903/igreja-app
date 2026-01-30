import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EntityForm from './EntityForm';
import DataTable from './DataTable';

const leaderFields = [
  { name: 'name', label: 'Nome Completo', type: 'text', required: true },
  { name: 'role', label: 'Cargo / Função', type: 'text', required: true, placeholder: 'Ex: Pastor Presidente, Líder de Jovens' },
  { 
    name: 'leader_type', 
    label: 'Categoria', 
    type: 'select', 
    required: true, 
    options: [
      {value:'diretoria', label:'Diretoria'},
      {value:'pastor', label:'Pastor'}, // Adicionado para bater com o App
      {value:'lider_departamento', label:'Líder de Departamento'},
      {value:'obreiro', label:'Obreiro / Diácono'}
    ] 
  },
  { name: 'photo_url', label: 'Foto de Perfil', type: 'image' },
  { name: 'bio', label: 'Biografia / Sobre', type: 'textarea', rows: 4 },
  { name: 'phone', label: 'Telefone', type: 'text' },
  { name: 'whatsapp', label: 'WhatsApp (Link ou Número)', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  // Removi display_order dos campos obrigatórios para evitar erro se não existir no banco
  // Se quiser usar, crie a coluna no Supabase primeiro
  { name: 'is_active', label: 'Status', type: 'boolean', defaultValue: true },
];

export default function AdminLeaders() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: leaders = [], isLoading, isError, error } = useQuery({ 
    queryKey: ['leaders'], 
    queryFn: async () => {
      // Busca sem ordenação forçada para evitar erro de coluna inexistente
      const { data, error } = await supabase.from('leaders').select('*');
      
      if (error) {
        console.error("Erro Supabase:", error);
        throw error;
      }
      
      // Ordena no front-end (se display_order existir, usa. Se não, usa ID)
      return data.sort((a, b) => (a.display_order || a.id) - (b.display_order || b.id));
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
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['leaders'] }); 
      toast.success('Líder salvo com sucesso!'); 
      setFormOpen(false); 
    },
    onError: (err) => toast.error('Erro ao salvar: ' + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('leaders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['leaders'] }); 
      toast.success('Líder removido!'); 
    }
  });

  const columns = [
    { 
      key: 'name', 
      label: 'Nome', 
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.photo_url ? (
            <img src={item.photo_url} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-500">{item.role}</p>
          </div>
        </div>
      ) 
    },
    { 
      key: 'leader_type', 
      label: 'Tipo', 
      render: (item) => {
        const labels = {
          diretoria: 'Diretoria',
          pastor: 'Pastor',
          lider_departamento: 'Líder Dept.',
          obreiro: 'Obreiro'
        };
        return <Badge variant="outline">{labels[item.leader_type] || item.leader_type}</Badge>;
      }
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

  if (isLoading) return <div className="p-8 text-center text-gray-500">Carregando líderes...</div>;
  
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
          <h2 className="text-lg font-bold text-gray-900">Liderança</h2>
          <p className="text-sm text-gray-500">{leaders.length} líderes cadastrados</p>
        </div>
        <Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Líder
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={leaders} 
        onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} 
        onDelete={(id) => deleteMutation.mutate(id)} 
        onToggleActive={(item) => saveMutation.mutate({...item, is_active: !item.is_active})} 
        emptyIcon={Users} 
      />

      <EntityForm 
        isOpen={formOpen} 
        onClose={() => setFormOpen(false)} 
        onSave={(data) => saveMutation.mutate(data)} 
        fields={leaderFields} 
        initialData={editingItem} 
        title={editingItem ? 'Editar Líder' : 'Novo Líder'} 
        isSaving={saveMutation.isPending} 
      />
    </div>
  );
}