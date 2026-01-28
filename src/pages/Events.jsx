import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Loader2, Repeat } from 'lucide-react';

export default function Events() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['public-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const translateDay = (day) => {
    const days = {
      'sunday': 'Domingo', 'monday': 'Segunda', 'tuesday': 'Terça',
      'wednesday': 'Quarta', 'thursday': 'Quinta', 'friday': 'Sexta', 'saturday': 'Sábado'
    };
    return days[day] || day;
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return { day: '', month: '', full: '', weekDay: '' };
    
    // SOLUÇÃO FINAL: String Slicing (Cortar o texto)
    // O formato do Supabase é SEMPRE "YYYY-MM-DD" (10 caracteres)
    // Ex: "2026-02-01"
    
    // Pega os pedaços diretamente da string, sem nenhuma conversão matemática
    const yearStr = dateString.substring(0, 4);
    const monthStr = dateString.substring(5, 7);
    const dayStr = dateString.substring(8, 10);

    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Converte para número SÓ para pegar o índice do array de meses
    const monthIndex = parseInt(monthStr, 10) - 1;
    const monthName = months[monthIndex];

    // Para o dia da semana, precisamos criar um objeto Date.
    // O TRUQUE: Adicionar "T12:00:00" garante que seja meio-dia em qualquer lugar do mundo.
    // Isso evita que o fuso horário mude o dia.
    const isoDateSafe = `${yearStr}-${monthStr}-${dayStr}T12:00:00`;
    const dateObj = new Date(isoDateSafe);
    
    const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const weekDayName = weekDays[dateObj.getDay()];

    return {
      day: dayStr, // Usa a string original "01"
      month: monthName,
      weekDay: weekDayName,
      full: `${weekDayName}, ${dayStr} de ${monthName}`
    };
  };

  const processEvents = () => {
    // Pega a data de hoje no formato YYYY-MM-DD local do usuário
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const recurring = events.filter(e => e.is_recurring);

    const oneTime = events.filter(e => {
      if (e.is_recurring || !e.date) return false;
      // Compara string com string. "2026-02-01" > "2025-05-20"
      // Pega só os primeiros 10 caracteres para garantir
      const eventDateStr = e.date.substring(0, 10);
      return eventDateStr >= todayStr;
    });

    return [...recurring, ...oneTime].sort((a, b) => {
        if (a.is_recurring && !b.is_recurring) return -1;
        if (!a.is_recurring && b.is_recurring) return 1;
        if (!a.is_recurring && !b.is_recurring) {
            return a.date.localeCompare(b.date);
        }
        return 0;
    });
  };

  const displayEvents = processEvents();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nossa Agenda</h1>
        <p className="text-gray-600">Fique por dentro de tudo que acontece em nossa igreja</p>
      </motion.div>

      {displayEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum evento programado para os próximos dias.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayEvents.map((event, index) => {
            const dateInfo = formatDateDisplay(event.date);
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row"
              >
                <div className="md:w-48 bg-amber-50 flex flex-col items-center justify-center p-6 border-r border-amber-100/50 shrink-0">
                  {event.is_recurring ? (
                    <div className="text-center">
                      <Repeat className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <span className="block font-bold text-amber-700 uppercase text-xs mb-1">
                        Recorrente
                      </span>
                      <span className="block font-bold text-xl text-amber-900 leading-tight">
                        {translateDay(event.recurrence_day)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="block text-4xl font-bold text-amber-500">
                        {dateInfo.day}
                      </span>
                      <span className="block font-medium text-amber-900 uppercase text-sm mt-1">
                        {dateInfo.month}
                      </span>
                      <span className="block text-xs text-amber-700/60 mt-1 font-medium">
                        {dateInfo.weekDay}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className="inline-block px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                        {event.event_type || 'Evento'}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>
                        {event.start_time?.slice(0, 5)}
                        {event.end_time && ` às ${event.end_time?.slice(0, 5)}`}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
