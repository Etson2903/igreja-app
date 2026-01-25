import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, Clock, User, Baby, Heart, Music, Globe, BookOpen, Mic2 } from 'lucide-react';

import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

const iconMap = {
  infantil: Baby,
  jovens: Users,
  mulheres: Heart,
  homens: Users,
  louvor: Music,
  missoes: Globe,
  escola: BookOpen,
  oracao: Heart,
  evangelismo: Mic2,
  default: Users
};

const colorMap = {
  infantil: 'from-pink-500 to-rose-500',
  jovens: 'from-blue-500 to-indigo-500',
  mulheres: 'from-purple-500 to-violet-500',
  homens: 'from-slate-600 to-gray-700',
  louvor: 'from-amber-500 to-orange-500',
  missoes: 'from-emerald-500 to-teal-500',
  escola: 'from-cyan-500 to-blue-500',
  oracao: 'from-red-500 to-rose-500',
  evangelismo: 'from-green-500 to-emerald-500',
  default: 'from-gray-500 to-gray-600'
};

export default function Departamentos() {
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.filter({ is_active: true }, 'order', 100)
  });

  const getIconComponent = (name) => {
    const lowerName = name?.toLowerCase() || '';
    for (const [key, Icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key)) return Icon;
    }
    return iconMap.default;
  };

  const getColorClass = (name) => {
    const lowerName = name?.toLowerCase() || '';
    for (const [key, color] of Object.entries(colorMap)) {
      if (lowerName.includes(key)) return color;
    }
    return colorMap.default;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <PageHeader title="Departamentos" subtitle="Conheça nossos ministérios" />

        {departments.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum departamento cadastrado"
            description="Os departamentos da igreja aparecerão aqui."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {departments.map((dept, index) => {
              const Icon = getIconComponent(dept.name);
              const colorClass = getColorClass(dept.name);

              return (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                >
                  <div className="flex">
                    <div className={`w-24 bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                      {dept.photo_url ? (
                        <img
                          src={dept.photo_url}
                          alt={dept.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon className="w-10 h-10 text-white" />
                      )}
                    </div>

                    <div className="flex-1 p-4">
                      <h3 className="font-semibold text-gray-900 text-lg">{dept.name}</h3>
                      
                      {dept.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{dept.description}</p>
                      )}

                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                        {dept.leader_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {dept.leader_name}
                          </span>
                        )}
                        {dept.meeting_day && dept.meeting_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dept.meeting_day} às {dept.meeting_time}
                          </span>
                        )}
                      </div>
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
