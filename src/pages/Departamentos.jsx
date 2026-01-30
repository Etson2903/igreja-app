import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase'; // USANDO SUPABASE DIRETO
import { motion } from 'framer-motion';
import { Users, Clock, User, Baby, Heart, Music, Globe, BookOpen, Mic2, Building2, AlertCircle } from 'lucide-react';

import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

// Mapeamento de ícones baseado no nome
const iconMap = {
  infantil: Baby,
  criança: Baby,
  kids: Baby,
  jovens: Users,
  juventude: Users,
  adolescentes: Users,
  mulheres: Heart,
  irmãs: Heart,
  feminino: Heart,
  homens: Users,
  varões: Users,
  masculino: Users,
  louvor: Music,
  adoração: Music,
  música: Music,
  missões: Globe,
  evangelismo: Mic2,
  escola: BookOpen,
  ebd: BookOpen,
  ensino: BookOpen,
  oração: Heart,
  intercessão: Heart,
  default: Building2
};

// Mapeamento de cores
const colorMap = {
  infantil: 'from-pink-500 to-rose-500',
  jovens: 'from-blue-500 to-indigo-500',
  mulheres: 'from-purple-500 to-violet-500',
  homens: 'from-slate-600 to-gray-700',
  louvor: 'from-amber-500 to-orange-500',
  missões: 'from-emerald-500 to-teal-500',
  escola: 'from-cyan-500 to-blue-500',
  oração: 'from-red-500 to-rose-500',
  evangelismo: 'from-green-500 to-emerald-500',
  default: 'from-gray-500 to-gray-600'
};

export default function Departamentos() {
  const { data: departments = [], isLoading, isError } = useQuery({
    queryKey: ['departments-public'],
    queryFn: async () => {
      // Busca SEM ordenação forçada para evitar erro de coluna inexistente
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.error("Erro ao buscar departamentos:", error);
        throw error;
      }
      
      // Ordenação manual no front-end (segura)
      return data.sort((a, b) => (a.display_order || a.id) - (b.display_order || b.id));
    }
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

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
        <p className="text-gray-500">Não foi possível carregar os departamentos.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <PageHeader title="Departamentos" subtitle="Nossos ministérios e grupos" />

        {departments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Nenhum departamento"
            description="Em breve os departamentos serão listados aqui."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-4">
            {departments.map((dept, index) => {
              const Icon = getIconComponent(dept.name);
              const colorClass = getColorClass(dept.name);

              return (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex min-h-[110px]">
                    {/* Coluna da Imagem/Ícone */}
                    <div className={`w-28 relative flex-shrink-0 bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                      {dept.photo_url ? (
                        <img
                          src={dept.photo_url}
                          alt={dept.name}
                          className="w-full h-full object-cover absolute inset-0"
                        />
                      ) : (
                        <Icon className="w-10 h-10 text-white opacity-90" />
                      )}
                    </div>

                    {/* Coluna do Conteúdo */}
                    <div className="flex-1 p-4 flex flex-col justify-center">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{dept.name}</h3>
                      
                      {dept.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                          {dept.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-gray-500 mt-auto">
                        {dept.leader_name && (
                          <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                            <User className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-medium">{dept.leader_name}</span>
                          </span>
                        )}
                        
                        {(dept.meeting_day || dept.meeting_time) && (
                          <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            <span>
                              {dept.meeting_day} {dept.meeting_time && `• ${dept.meeting_time}`}
                            </span>
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