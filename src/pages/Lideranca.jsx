import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase'; // USANDO SUPABASE DIRETO
import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, User, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

export default function Lideranca() {
  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['leaders-public'],
    queryFn: async () => {
      // Busca direta no Supabase
      const { data, error } = await supabase
        .from('leaders')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Ordenação manual no front-end
      return data.sort((a, b) => (a.display_order || a.id) - (b.display_order || b.id));
    }
  });

  // Filtragem segura (case insensitive para evitar erros de digitação)
  const diretoria = leaders.filter(l => l.leader_type?.toLowerCase() === 'diretoria');
  const pastores = leaders.filter(l => l.leader_type?.toLowerCase() === 'pastor');
  const lideresDepartamento = leaders.filter(l => l.leader_type === 'lider_departamento' || !['diretoria', 'pastor'].includes(l.leader_type));

  const LeaderCard = ({ leader }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3"
    >
      <div className="flex gap-4">
        {leader.photo_url ? (
          <img
            src={leader.photo_url}
            alt={leader.name}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-gray-100"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-amber-600" />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="font-bold text-gray-900 text-lg leading-tight">{leader.name}</h3>
          <p className="text-sm text-amber-600 font-medium mb-1">{leader.role}</p>

          {leader.bio && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{leader.bio}</p>
          )}

          <div className="flex gap-2 mt-auto">
            {leader.whatsapp && (
              <a
                href={`https://wa.me/${leader.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {leader.phone && (
              <a
                href={`tel:${leader.phone}`}
                className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            {leader.email && (
              <a
                href={`mailto:${leader.email}`}
                className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 hover:bg-amber-100 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <PageHeader title="Liderança" subtitle="Conheça nossos pastores e líderes" />

        <Tabs defaultValue="diretoria" className="w-full mt-6">
          <TabsList className="w-full grid grid-cols-3 bg-white p-1 rounded-xl shadow-sm border border-gray-100 h-12">
            <TabsTrigger value="diretoria" className="rounded-lg text-xs md:text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              Diretoria
            </TabsTrigger>
            <TabsTrigger value="pastores" className="rounded-lg text-xs md:text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              Pastores
            </TabsTrigger>
            <TabsTrigger value="departamentos" className="rounded-lg text-xs md:text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              Líderes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diretoria" className="mt-4 space-y-3 min-h-[200px]">
            {diretoria.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum membro"
                description="A diretoria aparecerá aqui."
              />
            ) : (
              diretoria.map(leader => (
                <LeaderCard key={leader.id} leader={leader} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pastores" className="mt-4 space-y-3 min-h-[200px]">
            {pastores.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum pastor"
                description="Os pastores aparecerão aqui."
              />
            ) : (
              pastores.map(leader => (
                <LeaderCard key={leader.id} leader={leader} />
              ))
            )}
          </TabsContent>

          <TabsContent value="departamentos" className="mt-4 space-y-3 min-h-[200px]">
            {lideresDepartamento.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum líder"
                description="Os líderes de departamentos aparecerão aqui."
              />
            ) : (
              lideresDepartamento.map(leader => (
                <LeaderCard key={leader.id} leader={leader} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}