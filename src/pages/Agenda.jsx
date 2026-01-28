import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Loader2, Repeat, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Agenda() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['agenda-events'],
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
    
    const parts = dateString.split('T')[0].split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parts[2];

    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const monthName = months[month - 1];

    const safeDate = new Date(year, month - 1, parseInt(day), 12, 0, 0);
    const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const weekDayName = weekDays[safeDate.getDay()];

    return {
      day: day,
      month: monthName,
      weekDay: weekDayName,
      full: `${weekDayName}, ${day} de ${monthName}`
    };
  };

  const processEvents = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const recurring = events.filter(e => e.is_recurring);

    const oneTime = events.filter(e => {
      if (e.is_recurring || !e.date) return false;
      const eventDateStr = e.date.split('T')[0];
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <Link to="/" className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Agenda</h1>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {displayEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white p-6 rounded-full inline-block mb-4 shadow-sm">
              <Calendar className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhum evento</h3>
            <p className="text-gray-500">Não há eventos programados para os próximos dias.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayEvents.map((event, index) => {
              const dateInfo = formatDateDisplay(event.date);
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4"
                >
                  <div className="flex flex-col items-center justify-center bg-amber-50 rounded-xl w-16 h-16 shrink-0 border border-amber-100">
                    {event.is_recurring ? (
                      <>
                        <Repeat className="w-5 h-5 text-amber-600 mb-0.5" />
                        <span className="text-[10px] font-bold text-amber-700 uppercase">Todo</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl font-bold text-amber-600 leading-none">{dateInfo.day}</span>
                        <span className="text-[10px] font-bold text-amber-700 uppercase mt-0.5">{dateInfo.month.substring(0, 3)}</span>
                      </>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{event.title}</h3>
                      {event.event_type && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wide">
                          {event.event_type}
                        </span>
                      )}
                    </div>
                    
                    {!event.is_recurring && (
                      <p className="text-sm text-amber-600 font-medium mb-2">
                        {dateInfo.full}
                      </p>
                    )}

                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          {event.start_time?.slice(0, 5)}
                          {event.end_time && ` - ${event.end_time?.slice(0, 5)}`}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          <span className="truncate max-w-[150px]">{event.location}</span>
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
    </div>
  );
}
