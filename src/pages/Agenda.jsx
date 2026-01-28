import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Calendar as CalIcon, Clock, MapPin, Loader2, Repeat, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Agenda() {
  // Estado para o calendário visual (Mês atual)
  const [currentDate, setCurrentDate] = useState(new Date());

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

  // --- TRATAMENTO DE DATA (STRING PURA) ---
  const parseDate = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split('T')[0].split('-');
    return {
      year: parseInt(parts[0]),
      month: parseInt(parts[1]), // 1-12
      day: parseInt(parts[2])
    };
  };

  const getMonthName = (monthIndex) => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[monthIndex];
  };

  // --- COMPONENTE DE CALENDÁRIO VISUAL ---
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-11

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Dom) - 6 (Sab)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Dias vazios antes do dia 1
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Dias do mês
    for (let d = 1; d <= daysInMonth; d++) {
      // Verifica se tem evento neste dia
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const hasEvent = events.some(e => {
        if (e.is_recurring) return false; // Não marcamos recorrentes no calendário simples para não poluir
        const start = e.date.split('T')[0];
        const end = e.end_date ? e.end_date.split('T')[0] : start;
        return dateStr >= start && dateStr <= end;
      });

      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

      days.push(
        <div key={d} className="h-8 w-8 flex items-center justify-center relative">
          <span className={`text-sm ${isToday ? 'font-bold text-amber-600' : 'text-gray-700'}`}>
            {d}
          </span>
          {hasEvent && (
            <div className="absolute bottom-1 w-1 h-1 bg-amber-500 rounded-full"></div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <span className="font-bold text-gray-900 capitalize">
            {getMonthName(month)} {year}
          </span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <span key={i} className="text-xs font-bold text-gray-400">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 justify-items-center">
          {days}
        </div>
      </div>
    );
  };

  // --- LISTA DE EVENTOS ---
  const displayEvents = events.filter(e => {
    // Filtra apenas eventos futuros ou recorrentes
    if (e.is_recurring) return true;
    const nowStr = new Date().toISOString().split('T')[0];
    const end = e.end_date ? e.end_date.split('T')[0] : e.date.split('T')[0];
    return end >= nowStr;
  }).sort((a, b) => {
     if (a.is_recurring && !b.is_recurring) return -1;
     if (!a.is_recurring && b.is_recurring) return 1;
     return a.date.localeCompare(b.date);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <Link to="/" className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Agenda</h1>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        
        {/* CALENDÁRIO VISUAL */}
        {renderCalendar()}

        {/* LISTA DE EVENTOS */}
        <div className="space-y-4">
          {displayEvents.map((event, index) => {
            const start = parseDate(event.date);
            const end = parseDate(event.end_date);
            const isMultiDay = end && (start.day !== end.day || start.month !== end.month);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4"
              >
                {/* Data Box */}
                <div className="flex flex-col items-center justify-center bg-amber-50 rounded-xl w-16 h-16 shrink-0 border border-amber-100">
                  {event.is_recurring ? (
                    <>
                      <Repeat className="w-5 h-5 text-amber-600 mb-0.5" />
                      <span className="text-[10px] font-bold text-amber-700 uppercase">Todo</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-bold text-amber-600 leading-none">{start.day}</span>
                      <span className="text-[10px] font-bold text-amber-700 uppercase mt-0.5">
                        {getMonthName(start.month - 1).substring(0, 3)}
                      </span>
                    </>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{event.title}</h3>
                    {event.event_type && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wide">
                        {event.event_type}
                      </span>
                    )}
                  </div>
                  
                  {/* Exibição de Data Estendida (Multidia) */}
                  {!event.is_recurring && isMultiDay && (
                    <p className="text-sm text-amber-600 font-bold mb-2">
                      {start.day}/{start.month} até {end.day}/{end.month}
                    </p>
                  )}

                  {!event.is_recurring && !isMultiDay && (
                    <p className="text-sm text-amber-600 font-medium mb-2">
                      {start.day} de {getMonthName(start.month - 1)}
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
      </div>
    </div>
  );
}
