import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase'; // MIGRADO PARA SUPABASE
import { motion } from 'framer-motion';
import { QrCode, Copy, Check, Heart, Building2, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function Ofertas() {
  const [copiedField, setCopiedField] = useState(null);

  // Busca informações financeiras da tabela settings
  const { data: churchInfo, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('settings').select('*').single();
      if (error && error.code !== 'PGRST116') console.error(error);
      return data || {};
    }
  });

  const copyToClipboard = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado para a área de transferência!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <PageHeader title="Ofertar" subtitle="Dízimos e ofertas" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white mb-6 shadow-lg relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

          <div className="relative z-10 flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <Heart className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">Contribua com Amor</h2>
              <p className="text-amber-100 text-sm font-medium">Cada oferta faz a diferença</p>
            </div>
          </div>
          <p className="relative z-10 text-sm text-amber-50 leading-relaxed italic border-l-2 border-white/30 pl-3">
            "Cada um contribua segundo propôs no seu coração, não com tristeza ou por necessidade; 
            porque Deus ama ao que dá com alegria." <br/>
            <span className="text-xs font-bold not-italic mt-1 block opacity-80">- 2 Coríntios 9:7</span>
          </p>
        </motion.div>

        <Tabs defaultValue="pix" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-gray-100 rounded-xl p-1 mb-4 h-12">
            <TabsTrigger value="pix" className="rounded-lg flex items-center gap-2 h-full">
              <QrCode className="w-4 h-4" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="banco" className="rounded-lg flex items-center gap-2 h-full">
              <Building2 className="w-4 h-4" />
              Dados Bancários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pix">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              {churchInfo?.pix_qrcode_url ? (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl shadow-md mb-4 border border-gray-100">
                    <img
                      src={churchInfo.pix_qrcode_url}
                      alt="QR Code PIX"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-500 text-center mb-6 font-medium">
                    Escaneie o QR Code acima com o app do seu banco
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                    <QrCode className="w-10 h-10 text-amber-400 opacity-50" />
                  </div>
                  <p className="text-gray-400 text-center font-medium">QR Code não cadastrado</p>
                </div>
              )}

              {churchInfo?.pix_key && (
                <div className="mt-2 pt-6 border-t border-gray-100 w-full">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">
                    Ou copie a chave PIX
                  </p>
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <div className="flex-1 px-2 font-mono text-sm text-gray-700 truncate text-center select-all">
                      {churchInfo.pix_key}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(churchInfo.pix_key, 'pix')}
                      className={`rounded-lg transition-all ${copiedField === 'pix' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-sm'}`}
                    >
                      {copiedField === 'pix' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="banco">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              {churchInfo?.bank_name ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">{churchInfo.bank_name}</p>
                      <p className="text-sm text-gray-500">Conta Corrente</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {churchInfo.bank_holder && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-500 font-medium">Titular</span>
                        <span className="font-semibold text-gray-900 text-right">{churchInfo.bank_holder}</span>
                      </div>
                    )}
                    
                    {churchInfo.bank_agency && (
                      <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded-lg">
                        <span className="text-sm text-gray-500 font-medium">Agência</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-gray-900">{churchInfo.bank_agency}</span>
                          <button
                            onClick={() => copyToClipboard(churchInfo.bank_agency, 'agency')}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                          >
                            {copiedField === 'agency' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {churchInfo.bank_account && (
                      <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded-lg">
                        <span className="text-sm text-gray-500 font-medium">Conta</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-gray-900">{churchInfo.bank_account}</span>
                          <button
                            onClick={() => copyToClipboard(churchInfo.bank_account, 'account')}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                          >
                            {copiedField === 'account' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-10">
                  <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <CreditCard className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-center font-medium">Dados bancários não disponíveis</p>
                  <p className="text-gray-400 text-xs text-center mt-1">Utilize a opção PIX</p>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-amber-50 rounded-xl p-5 border border-amber-100 text-center"
        >
          <p className="text-sm text-amber-800 font-medium">
            Após realizar sua contribuição, envie o comprovante 
            para a secretaria se desejar identificação.
          </p>
        </motion.div>
      </div>
    </div>
  );
}