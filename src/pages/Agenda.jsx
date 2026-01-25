import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function Agenda() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.filter({ is_active: true }, 'date', 100)
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date) => {
    return events.filter(e => isSameDay(parseISO(e.date), date));
  };

  const selectedEvents = getEventsForDate(selectedDate);

  const eventTypeColors = {
    culto: 'bg-blue-500',
    evento: 'bg-purple-500',
    reuniao: 'bg-amber-500',
    conferencia: 'bg-rose-500',
    encontro: 'bg-emerald-500'
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <PageHeader title="Agenda" subtitle="Cultos e eventos da igreja" />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="rounded-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="rounded-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const dayEvents = getEventsForDate(day);
              const isSelected = isSameDay(day, selectedDate);
              const hasEvents = dayEvents.length > 0;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative aspect-square rounded-xl flex flex-col items-center justify-center
                    transition-all duration-200
                    ${isSelected ? 'bg-amber-500 text-white shadow-lg' : 'hover:bg-gray-100'}
                    ${isToday(day) && !isSelected ? 'ring-2 ring-amber-300' : ''}
                  `}
                >
                  <span className={`text-sm font-medium ${!isSameMonth(day, currentMonth) ? 'text-gray-300' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 capitalize">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h3>

          <AnimatePresence mode="wait">
            {selectedEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl p-6 text-center border border-gray-100"
              >
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Nenhum evento nesta data</p>
              </motion.div>
            ) : (
              selectedEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex gap-4">
                    <div className={`w-1 rounded-full ${eventTypeColors[event.event_type] || 'bg-gray-300'}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                        {event.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {event.start_time}{event.end_time && ` - ${event.end_time}`}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
