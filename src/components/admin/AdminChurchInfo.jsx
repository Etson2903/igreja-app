import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, Church, Globe, CreditCard, Save, Upload } from 'lucide-react';
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
    queryFn: async () => {
      const { data, error } = await supabase.from('church_info').select('*').single();
      if (error && error.code !== 'PGRST116') throw error; // Ignora erro se não existir registro ainda
      return data || {};
    }
  });

  useEffect(() => { if (churchInfo) setFormData(churchInfo); }, [churchInfo]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Remove campos que não devem ser enviados (como created_at se não for necessário)
      const { id, created_at, ...updateData } = data;
      
      if (data.id) {
        const { error } = await supabase.from('church_info').update(updateData).eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('church_info').insert([updateData]);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['churchInfo'] }); toast.success('Dados salvos!'); },
    onError: (err) => { console.error(err); toast.error('Erro ao salvar: ' + err.message); }
  });

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleUpload = async (field, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('files').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('files').getPublicUrl(fileName);
      handleChange(field, publicUrl);
      toast.success('Upload concluído!');
    } catch (error) {
      toast.error('Erro no upload: ' + error.message);
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mt-10" />;

  const ImageUploadField = ({ label, field, currentUrl }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {currentUrl && <img src={currentUrl} alt={label} className="w-20 h-20 rounded-lg object-cover border" />}
        <div className="flex-1">
          <div className="relative">
            <Input type="file" accept="image/*" onChange={(e) => handleUpload(field, e.target.files[0])} disabled={uploading[field]} className="hidden" id={`file-${field}`} />
            <Label htmlFor={`file-${field}`} className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white border rounded-md hover:bg-gray-50">
              {uploading[field] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading[field] ? 'Enviando...' : 'Escolher Imagem'}
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-6">
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="imagens">Imagens</TabsTrigger>
          <TabsTrigger value="redes">Redes</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 mb-4"><Church className="w-5 h-5 text-amber-500" /><h3 className="font-semibold text-gray-900">Informações Gerais</h3></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nome da Igreja</Label><Input value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Endereço</Label><Input value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} /></div>
        </TabsContent>

        <TabsContent value="imagens" className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <ImageUploadField label="Logomarca" field="logo_url" currentUrl={formData.logo_url} />
          <ImageUploadField label="Banner da Home (Fundo)" field="banner_url" currentUrl={formData.banner_url} />
        </TabsContent>

        <TabsContent value="redes" className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 mb-4"><Globe className="w-5 h-5 text-amber-500" /><h3 className="font-semibold text-gray-900">Redes Sociais</h3></div>
          <div className="space-y-2"><Label>Instagram (URL)</Label><Input value={formData.instagram_url || ''} onChange={(e) => handleChange('instagram_url', e.target.value)} /></div>
          <div className="space-y-2"><Label>Facebook (URL)</Label><Input value={formData.facebook_url || ''} onChange={(e) => handleChange('facebook_url', e.target.value)} /></div>
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
