import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { QrCode, Copy, Check, Heart, Building2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function Ofertas() {
  const [copiedField, setCopiedField] = useState(null);

  const { data: churchInfo, isLoading } = useQuery({
    queryKey: ['churchInfo'],
    queryFn: async () => {
      const list = await base44.entities.ChurchInfo.list();
      return list[0] || null;
    }
  });

  const copyToClipboard = (text, field) => {
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
          className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white mb-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Heart className="w-6 h-6" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Contribua com Amor</h2>
              <p className="text-amber-100 text-sm">Cada oferta faz a diferença</p>
            </div>
          </div>
          <p className="text-sm text-amber-50 leading-relaxed">
            "Cada um contribua segundo propôs no seu coração, não com tristeza ou por necessidade; 
            porque Deus ama ao que dá com alegria." - 2 Coríntios 9:7
          </p>
        </motion.div>

        <Tabs defaultValue="pix" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-gray-100 rounded-xl p-1">
            <TabsTrigger value="pix" className="rounded-lg flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="banco" className="rounded-lg flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Dados Bancários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pix" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              {churchInfo?.pix_qrcode_url ? (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl shadow-md mb-4">
                    <img
                      src={churchInfo.pix_qrcode_url}
                      alt="QR Code PIX"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Escaneie o QR Code acima com o app do seu banco
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                    <QrCode className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-gray-500 text-center">QR Code não disponível</p>
                </div>
              )}

              {churchInfo?.pix_key && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">Ou copie a chave PIX:</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 font-mono text-sm truncate">
                      {churchInfo.pix_key}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(churchInfo.pix_key, 'pix')}
                      className="rounded-xl flex-shrink-0"
                    >
                      {copiedField === 'pix' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="banco" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              {churchInfo?.bank_name ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{churchInfo.bank_name}</p>
                      <p className="text-sm text-gray-500">Dados para transferência</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {churchInfo.bank_holder && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Titular</span>
                        <span className="font-medium text-gray-900">{churchInfo.bank_holder}</span>
                      </div>
                    )}
                    {churchInfo.bank_agency && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Agência</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{churchInfo.bank_agency}</span>
                          <button
                            onClick={() => copyToClipboard(churchInfo.bank_agency, 'agency')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {copiedField === 'agency' ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {churchInfo.bank_account && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Conta</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{churchInfo.bank_account}</span>
                          <button
                            onClick={() => copyToClipboard(churchInfo.bank_account, 'account')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {copiedField === 'account' ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-center">Dados bancários não disponíveis</p>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-100"
        >
          <p className="text-sm text-amber-800 text-center">
            Após realizar sua contribuição, você pode enviar o comprovante 
            para a secretaria da igreja para fins de controle.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
