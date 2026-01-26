import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import EntityForm from './EntityForm';
import DataTable from './DataTable';

const eventFields = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'description', label: 'Descrição', type: 'textarea' },
  { name: 'event_type', label: 'Tipo', type: 'select', options: [{value:'culto',label:'Culto'},{value:'evento',label:'Evento'},{value:'reuniao',label:'Reunião'}] },
  { name: 'date', label: 'Data', type: 'date', required: true },
  { name: 'start_time', label: 'Início', type: 'time' },
  { name: 'location', label: 'Local', type: 'text' },
  { name: 'image_url', label: 'Imagem', type: 'image' },
  { name: 'is_active', label: 'Status', type: 'boolean', defaultValue: true },
];

export default function AdminEvents() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: () => base44.entities.Event.list('-date', 100) });

  const createMutation = useMutation({ mutationFn: (data) => base44.entities.Event.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); toast.success('Adicionado!'); setFormOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.Event.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); toast.success('Atualizado!'); setFormOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: (id) => base44.entities.Event.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); toast.success('Removido!'); } });

  const columns = [
    { key: 'title', label: 'Evento', render: (item) => <div className="flex items-center gap-3">{item.image_url ? <img src={item.image_url} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center"><Calendar className="w-5 h-5 text-purple-500" /></div>}<div><p className="font-medium">{item.title}</p><p className="text-sm text-gray-500">{item.location}</p></div></div> },
    { key: 'date', label: 'Data', render: (item) => <div><p className="font-medium">{format(parseISO(item.date), "d 'de' MMM", { locale: ptBR })}</p>{item.start_time && <p className="text-sm text-gray-500">{item.start_time}</p>}</div> },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Ativo' : 'Inativo'}</Badge> }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-gray-500">{events.length} eventos</p><Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button></div>
      <DataTable columns={columns} data={events} onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} onDelete={(id) => deleteMutation.mutate(id)} onToggleActive={(item) => updateMutation.mutate({id: item.id, data: {is_active: !item.is_active}})} emptyIcon={Calendar} />
      <EntityForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={(data) => editingItem ? updateMutation.mutate({id: editingItem.id, data}) : createMutation.mutate(data)} fields={eventFields} initialData={editingItem} title={editingItem ? 'Editar' : 'Novo'} isSaving={createMutation.isPending || updateMutation.isPending} />
    </div>
  );
}
