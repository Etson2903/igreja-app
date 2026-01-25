import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  BookOpen, 
  MapPin, 
  Users, 
  Heart, 
  Play, 
  Bell, 
  Church 
} from 'lucide-react';

const actions = [
  { icon: Calendar, label: 'Agenda', page: 'Agenda', color: 'bg-blue-500' },
  { icon: Play, label: 'Ao Vivo', page: 'AoVivo', color: 'bg-red-500' },
  { icon: Heart, label: 'Ofertar', page: 'Ofertas', color: 'bg-amber-500' },
  { icon: BookOpen, label: 'Estudos', page: 'Conteudo', color: 'bg-emerald-500' },
  { icon: Users, label: 'Liderança', page: 'Lideranca', color: 'bg-purple-500' },
  { icon: MapPin, label: 'Congregações', page: 'Congregacoes', color: 'bg-rose-500' },
  { icon: Church, label: 'Departamentos', page: 'Departamentos', color: 'bg-indigo-500' },
  { icon: Bell, label: 'Notícias', page: 'Noticias', color: 'bg-teal-500' },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3 md:gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link 
            to={createPageUrl(action.page)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`${action.color} w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200`}>
              <action.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <span className="text-xs md:text-sm text-gray-700 font-medium text-center">
              {action.label}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
