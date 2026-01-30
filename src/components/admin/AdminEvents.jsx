import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Save, Calendar as CalendarIcon, Clock, RefreshCw, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminEvents() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isRecurring, setIsRecurring] = useState(false);
  
  const queryClient = useQueryClient();

  const formatDateUTC = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const { data: events } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*');
      if (error) throw error;
      
      return data.sort((a, b) => {
         if (a.is_recurring && !b.is_recurring) return -1;
         if (!a.is_recurring && b.is_recurring) return 1;
         
         if (a.is_recurring && b.is_recurring) {
            const days = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
            return days[a.recurrence_day] - days[b.recurrence_day];
         }

         if (a.date && b.date) return a.date.localeCompare(b.date);
         return 0;
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const dataToSave = {
        title: formData.get('title'),
        description: formData.get('description'),
        start_time: formData.get('start_time'),
        location: formData.get('location'),
        event_type: formData.get('event_type'),
        is_recurring: isRecurring,
        is_active: true
      };

      if (isRecurring) {
        dataToSave.recurrence_day = formData.get('recurrence_day');
        dataToSave.date = null;
        dataToSave.end_date = null;
      } else {
        dataToSave.date = formData.get('date');
        dataToSave.end_date = formData.get('end_date') || formData.get('date');
        dataToSave.recurrence_day = null;
      }

      if (editingEvent?.id) {
        const { error } = await supabase.from('events').update(dataToSave).eq('id', editingEvent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert([dataToSave]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminEvents']);
      setIsOpen(false);
      toast.success('Evento salvo com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao salvar: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminEvents']);
      toast.success('Evento excluído!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveMutation.mutate(formData);
  };

  const openNew = () => {
    setEditingEvent(null);
    setIsRecurring(false);
    setIsOpen(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setIsRecurring(event.is_recurring);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Agenda</h2>
        <Button onClick={openNew} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4 mr-2" /> Novo Evento
        </Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white p-6 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-4 border-b pb-2">
              <DialogTitle>{editingEvent ? 'Editar' : 'Novo'} Evento</DialogTitle>
              <DialogDescription>Preencha os dados do evento.</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input name="title" defaultValue={editingEvent?.title} required className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Evento</Label>
                <select 
                    name="event_type" 
                    defaultValue={editingEvent?.event_type || "culto"}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-amber-500"
                    required
                >
                    <option value="culto">Culto</option>
                    <option value="evento">Evento Especial</option>
                    <option value="ensaio">Ensaio</option>
                    <option value="reuniao">Reunião</option>
                    <option value="ebd">Escola Dominical</option>
                </select>
              </div>

              <div className="flex items-center gap-3 border p-4 rounded-lg bg-blue-50 border-blue-100">
                <input 
                    type="checkbox"
                    id="rec"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <Label htmlFor="rec" className="cursor-pointer font-medium text-blue-900 select-none">
                    Evento Recorrente (Semanal)?
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {isRecurring ? (
                    <div className="space-y-2 col-span-2">
                        <Label>Dia da Semana</Label>
                        <select 
                            name="recurrence_day" 
                            defaultValue={editingEvent?.recurrence_day || "sunday"}
                            className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="sunday">Domingo</option>
                            <option value="monday">Segunda-feira</option>
                            <option value="tuesday">Terça-feira</option>
                            <option value="wednesday">Quarta-feira</option>
                            <option value="thursday">Quinta-feira</option>
                            <option value="friday">Sexta-feira</option>
                            <option value="saturday">Sábado</option>
                        </select>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label>Data Início</Label>
                            <Input type="date" name="date" defaultValue={editingEvent?.date} required className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Data Fim (Opcional)</Label>
                            <Input type="date" name="end_date" defaultValue={editingEvent?.end_date} className="bg-gray-50" />
                        </div>
                    </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input type="time" name="start_time" defaultValue={editingEvent?.start_time} required className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label>Local</Label>
                  <Input name="location" defaultValue={editingEvent?.location || 'Templo Sede'} className="bg-gray-50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea name="description" defaultValue={editingEvent?.description} className="bg-gray-50" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {events?.map((event) => (
          <div key={event.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center hover:shadow-md transition-all">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800">{event.title}</h3>
                <span className="text-[10px] uppercase bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold tracking-wide">
                    {event.event_type}
                </span>
              </div>
              <div className="text-sm text-gray-500 flex gap-3 mt-1">
                {event.is_recurring ? (
                  <span className="flex items-center gap-1 text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded text-xs">
                    <RefreshCw className="w-3 h-3" /> Todo(a) <span className="capitalize">{event.recurrence_day}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs">
                    <CalendarIcon className="w-3 h-3" /> 
                    {formatDateUTC(event.date)}
                    {event.end_date && event.end_date !== event.date && ` até ${formatDateUTC(event.end_date)}`}
                  </span>
                )}
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs">
                    <Clock className="w-3 h-3" /> {event.start_time}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => openEdit(event)} className="text-gray-400 hover:text-amber-600 hover:bg-amber-50">
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(event.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
