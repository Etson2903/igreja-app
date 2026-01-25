import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, User } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

export default function Lideranca() {
  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['leaders'],
    queryFn: () => base44.entities.Leader.filter({ is_active: true }, 'order', 100)
  });

  const diretoria = leaders.filter(l => l.leader_type === 'diretoria');
  const pastores = leaders.filter(l => l.leader_type === 'pastor');
  const lideresDepartamento = leaders.filter(l => l.leader_type === 'lider_departamento');

  const LeaderCard = ({ leader }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
    >
      <div className="flex gap-4">
        {leader.photo_url ? (
          <img
            src={leader.photo_url}
            alt={leader.name}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-amber-600" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{leader.name}</h3>
          <p className="text-sm text-amber-600 font-medium">{leader.role}</p>

          {leader.bio && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{leader.bio}</p>
          )}

          <div className="flex gap-2 mt-3">
            {leader.whatsapp && (
              <a
                href={`https://wa.me/${leader.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {leader.phone && (
              <a
                href={`tel:${leader.phone}`}
                className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            {leader.email && (
              <a
                href={`mailto:${leader.email}`}
                className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 hover:bg-amber-200 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <PageHeader title="Liderança" subtitle="Conheça nossos líderes" />

        <Tabs defaultValue="diretoria" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-gray-100 rounded-xl p-1">
            <TabsTrigger value="diretoria" className="rounded-lg text-xs md:text-sm">
              Diretoria
            </TabsTrigger>
            <TabsTrigger value="pastores" className="rounded-lg text-xs md:text-sm">
              Pastores
            </TabsTrigger>
            <TabsTrigger value="departamentos" className="rounded-lg text-xs md:text-sm">
              Líderes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diretoria" className="mt-4 space-y-3">
            {diretoria.length === 0 ? (
              <EmptyState
                icon={User}
                title="Nenhum membro cadastrado"
                description="A diretoria da igreja aparecerá aqui."
              />
            ) : (
              diretoria.map(leader => (
                <LeaderCard key={leader.id} leader={leader} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pastores" className="mt-4 space-y-3">
            {pastores.length === 0 ? (
              <EmptyState
                icon={User}
                title="Nenhum pastor cadastrado"
                description="Os pastores da igreja aparecerão aqui."
              />
            ) : (
              pastores.map(leader => (
                <LeaderCard key={leader.id} leader={leader} />
              ))
            )}
          </TabsContent>

          <TabsContent value="departamentos" className="mt-4 space-y-3">
            {lideresDepartamento.length === 0 ? (
              <EmptyState
                icon={User}
                title="Nenhum líder cadastrado"
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
