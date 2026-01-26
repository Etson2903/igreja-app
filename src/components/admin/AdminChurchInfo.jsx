import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Church, Globe, CreditCard, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AdminChurchInfo() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState({});

  const { data: churchInfo, isLoading } = useQuery({
    queryKey: ['churchInfo'],
    queryFn: async () => { const list = await base44.entities.ChurchInfo.list(); return list[0] || null; }
  });

  useEffect(() => { if (churchInfo) setFormData(churchInfo); }, [churchInfo]);

  const saveMutation = useMutation({
    mutationFn: async (data) => churchInfo?.id ? base44.entities.ChurchInfo.update(churchInfo.id, data) : base44.entities.ChurchInfo.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['churchInfo'] }); toast.success('Dados salvos!'); },
    onError: () => toast.error('Erro ao salvar')
  });

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleUpload = async (field, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange(field, file_url);
      toast.success('Imagem enviada!');
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mt-10" />;

  const ImageUploadField = ({ label, field, currentUrl }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {currentUrl && <img src={currentUrl} alt={label} className="w-20 h-20 rounded-lg object-cover" />}
        <div className="flex-1">
          <Input type="file" accept="image/*" onChange={(e) => handleUpload(field, e.target.files[0])} disabled={uploading[field]} />
          {uploading[field] && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Enviando...</p>}
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-6">
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="geral" className="rounded-lg">Geral</TabsTrigger>
          <TabsTrigger value="imagens" className="rounded-lg">Imagens</TabsTrigger>
          <TabsTrigger value="redes" className="rounded-lg">Redes</TabsTrigger>
          <TabsTrigger value="financeiro" className="rounded-lg">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 mb-4"><Church className="w-5 h-5 text-amber-500" /><h3 className="font-semibold text-gray-900">Informações Gerais</h3></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nome</Label><Input value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Endereço</Label><Input value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} /></div>
        </TabsContent>

        <TabsContent value="imagens" className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <ImageUploadField label="Logomarca" field="logo_url" currentUrl={formData.logo_url} />
          <ImageUploadField label="Banner da Home" field="banner_url" currentUrl={formData.banner_url} />
        </TabsContent>

        <TabsContent value="redes" className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 mb-4"><Globe className="w-5 h-5 text-amber-500" /><h3 className="font-semibold text-gray-900">Redes Sociais</h3></div>
          <div className="space-y-2"><Label>Instagram</Label><Input value={formData.instagram_url || ''} onChange={(e) => handleChange('instagram_url', e.target.value)} /></div>
          <div className="space-y-2"><Label>Facebook</Label><Input value={formData.facebook_url || ''} onChange={(e) => handleChange('facebook_url', e.target.value)} /></div>
          <div className="space-y-2"><Label>ID Canal YouTube</Label><Input value={formData.youtube_channel_id || ''} onChange={(e) => handleChange('youtube_channel_id', e.target.value)} /></div>
        </TabsContent>

        <TabsContent value="financeiro" className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 mb-4"><CreditCard className="w-5 h-5 text-amber-500" /><h3 className="font-semibold text-gray-900">Financeiro</h3></div>
          <div className="space-y-2"><Label>Chave PIX</Label><Input value={formData.pix_key || ''} onChange={(e) => handleChange('pix_key', e.target.value)} /></div>
          <ImageUploadField label="QR Code PIX" field="pix_qrcode_url" currentUrl={formData.pix_qrcode_url} />
        </TabsContent>
      </Tabs>
      <div className="flex justify-end"><Button type="submit" disabled={saveMutation.isPending} className="bg-amber-500 hover:bg-amber-600"><Save className="w-4 h-4 mr-2" /> Salvar Alterações</Button></div>
    </form>
  );
}
