import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NextEvents({ events }) {
  if (!events || events.length === 0) {
    return null;
  }

  const getDayLabel = (dateStr) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, 'dd/MM', { locale: ptBR });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Próximos Eventos</h2>
        <Link 
          to={createPageUrl('Agenda')}
          className="text-amber-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
        >
          Ver agenda
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-64 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            
            <div className="relative">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full mb-3">
                {getDayLabel(event.date)}
              </span>
              
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1">
                {event.title}
              </h3>
              
              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>{event.start_time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="line-clamp-1">{event.location || 'Igreja Sede'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
