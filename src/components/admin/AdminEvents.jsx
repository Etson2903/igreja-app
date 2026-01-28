import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, Calendar, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EntityForm from './EntityForm';
import DataTable from './DataTable';

const eventFields = [
  { name: 'title', label: 'Título do Evento', type: 'text', required: true },
  { name: 'description', label: 'Descrição Detalhada', type: 'textarea' },
  { name: 'event_type', label: 'Tipo', type: 'select', options: [{value:'culto',label:'Culto'},{value:'evento',label:'Evento Especial'},{value:'reuniao',label:'Reunião'}] },

  // Seção de Data e Hora
  { name: 'date', label: 'Data Início', type: 'date' },
  { name: 'end_date', label: 'Data Fim (Opcional)', type: 'date' }, // ADICIONADO AQUI
  { name: 'start_time', label: 'Horário de Início', type: 'time', required: true },
  { name: 'end_time', label: 'Horário de Término', type: 'time' },

  // Seção de Recorrência
  { name: 'is_recurring', label: 'Evento Recorrente? (Repete toda semana)', type: 'boolean', defaultValue: false, switchLabel: 'Sim, repete toda semana' },
  { name: 'recurrence_day', label: 'Dia da Semana (Se recorrente)', type: 'select', options: [
    {value:'sunday',label:'Domingo'},
    {value:'monday',label:'Segunda-feira'},
    {value:'tuesday',label:'Terça-feira'},
    {value:'wednesday',label:'Quarta-feira'},
    {value:'thursday',label:'Quinta-feira'},
    {value:'friday',label:'Sexta-feira'},
    {value:'saturday',label:'Sábado'}
  ]},

  { name: 'location', label: 'Local', type: 'text', placeholder: 'Ex: Templo Sede' },
  { name: 'image_url', label: 'Banner / Imagem', type: 'image' },
  { name: 'is_highlighted', label: 'Destaque na Home?', type: 'boolean', defaultValue: false },
  { name: 'is_active', label: 'Ativo', type: 'boolean', defaultValue: true },
];

const formatDateNoTimezone = (dateString, endDateString) => {
  if (!dateString) return '-';
  
  const parseDate = (str) => {
    const [year, month, day] = str.split('T')[0].split('-');
    return { day, month: parseInt(month) - 1 };
  };

  const start = parseDate(dateString);
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  
  if (endDateString && endDateString !== dateString) {
    const end = parseDate(endDateString);
    return `${start.day}/${months[start.month]} até ${end.day}/${months[end.month]}`;
  }

  return `${start.day} de ${months[start.month]}`;
};

const translateDay = (day) => {
  const days = {
    'sunday': 'Todo Domingo',
    'monday': 'Toda Segunda',
    'tuesday': 'Toda Terça',
    'wednesday': 'Toda Quarta',
    'thursday': 'Toda Quinta',
    'friday': 'Toda Sexta',
    'saturday': 'Todo Sábado'
  };
  return days[day] || day;
};

export default function AdminEvents() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const { id, created_at, ...payload } = data;

      // Validação simples
      if (!payload.is_recurring && !payload.date) {
        throw new Error('Se não for recorrente, precisa de uma data!');
      }
      if (payload.is_recurring && !payload.recurrence_day) {
        throw new Error('Se for recorrente, escolha o dia da semana!');
      }
      
      // Limpeza de campos vazios
      if (!payload.end_date) delete payload.end_date;

      if (id) {
        const { error } = await supabase.from('events').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); toast.success('Salvo!'); setFormOpen(false); },
    onError: (err) => toast.error('Erro: ' + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); toast.success('Removido!'); }
  });

  const columns = [
    { key: 'title', label: 'Evento', render: (item) => <div className="flex items-center gap-3">{item.image_url ? <img src={item.image_url} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center"><Calendar className="w-5 h-5 text-purple-500" /></div>}<div><p className="font-medium">{item.title}</p><p className="text-sm text-gray-500">{item.location}</p></div></div> },
    { key: 'date', label: 'Quando?', render: (item) =>
      <div>
        {item.is_recurring ? (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Repeat className="w-3 h-3 mr-1" /> {translateDay(item.recurrence_day)}
          </Badge>
        ) : (
          <p className="font-medium">{formatDateNoTimezone(item.date, item.end_date)}</p>
        )}
        {item.start_time && <p className="text-sm text-gray-500 mt-1">{item.start_time}</p>}
      </div>
    },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Ativo' : 'Inativo'}</Badge> }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="text-sm text-gray-500">{events.length} eventos</p><Button onClick={() => {setEditingItem(null); setFormOpen(true);}} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button></div>
      <DataTable columns={columns} data={events} onEdit={(item) => {setEditingItem(item); setFormOpen(true);}} onDelete={(id) => deleteMutation.mutate(id)} onToggleActive={(item) => saveMutation.mutate({...item, is_active: !item.is_active})} emptyIcon={Calendar} />
      <EntityForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={(data) => saveMutation.mutate(data)} fields={eventFields} initialData={editingItem} title={editingItem ? 'Editar' : 'Novo'} isSaving={saveMutation.isPending} />
    </div>
  );
}
