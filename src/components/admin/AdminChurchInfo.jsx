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

  // Busca dados da tabela 'settings' (padronizado com a Home)
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('settings').select('*').single();
      
      // Se der erro PGRST116 (nenhum registro), retorna vazio para criar depois
      if (error && error.code !== 'PGRST116') throw error;
      return data || {};
    }
  });

  useEffect(() => { if (settings) setFormData(settings); }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const { id, created_at, ...updateData } = data;
      
      // Se já tem ID, atualiza. Se não, cria o primeiro registro.
      if (data.id) {
        const { error } = await supabase.from('settings').update(updateData).eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('settings').insert([updateData]);
        if (error) throw error;
      }
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['settings'] }); 
      toast.success('Configurações salvas com sucesso!'); 
    },
    onError: (err) => { 
      console.error(err); 
      toast.error('Erro ao salvar: ' + err.message); 
    }
  });

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleUpload = async (field, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `settings/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
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

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  const ImageUploadField = ({ label, field, currentUrl }) => (
    <div className="space-y-2 border p-4 rounded-lg bg-gray-50">
      <Label className="font-semibold text-gray-700">{label}</Label>
      <div className="flex items-center gap-4 mt-2">
        {currentUrl ? (
          <img src={currentUrl} alt={label} className="w-32 h-20 rounded-lg object-cover border bg-white" />
        ) : (
          <div className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-white text-xs text-gray-400">
            Sem imagem
          </div>
        )}
        <div className="flex-1">
          <div className="relative">
            <Input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleUpload(field, e.target.files[0])} 
              disabled={uploading[field]} 
              className="hidden" 
              id={`file-${field}`} 
            />
            <Label 
              htmlFor={`file-${field}`} 
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md transition-colors w-fit ${uploading[field] ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
            >
              {uploading[field] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading[field] ? 'Enviando...' : 'Escolher Imagem'}
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Configurações da Igreja</h2>
        <Button type="submit" disabled={saveMutation.isPending} className="bg-amber-500 hover:bg-amber-600 text-white">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Tudo
        </Button>
      </div>

      <Tabs defaultValue="redes" className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-xl w-full justify-start h-auto flex-wrap">
          <TabsTrigger value="redes" className="px-6 py-2">Redes Sociais</TabsTrigger>
          <TabsTrigger value="imagens" className="px-6 py-2">Banner & Logo</TabsTrigger>
          <TabsTrigger value="financeiro" className="px-6 py-2">Financeiro (PIX)</TabsTrigger>
        </TabsList>

        <TabsContent value="redes" className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b"><Globe className="w-5 h-5 text-amber-500" /><h3 className="font-semibold text-gray-900">Links das Redes</h3></div>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Instagram (Link Completo)</Label>
              <Input placeholder="https://instagram.com/suaigreja" value={formData.instagram_url || ''} onChange={(e) => handleChange('instagram_url', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Facebook (Link Completo)</Label>
              <Input placeholder="https://facebook.com/suaigreja" value={formData.facebook_url || ''} onChange={(e) => handleChange('facebook_url', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>YouTube (Link Completo)</Label>
              <Input placeholder="https://youtube.com/c/suaigreja" value={formData.youtube_url || ''} onChange={(e) => handleChange('youtube_url', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp (Link ou Número)</Label>
              <Input placeholder="https://wa.me/5511999999999" value={formData.whatsapp_url || ''} onChange={(e) => handleChange('whatsapp_url', e.target.value)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="imagens" className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b"><Church className="w-5 h-5 text-amber-500" /><h3 className="font-semibold text-gray-900">Identidade Visual</h3></div>
          <ImageUploadField label="Banner da Tela Inicial (App)" field="banner_url" currentUrl={formData.banner_url} />
          {/* Adicionei logo_url caso queira usar no futuro */}
          {/* <ImageUploadField label="Logomarca do App" field="logo_url" currentUrl={formData.logo_url} /> */}
        </TabsContent>

        <TabsContent value="financeiro" className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b"><CreditCard className="w-5 h-5 text-amber-500" /><h3 className="font-semibold text-gray-900">Dados Bancários / PIX</h3></div>
          <div className="space-y-2">
            <Label>Chave PIX (Texto)</Label>
            <Input placeholder="CNPJ ou Email..." value={formData.pix_key || ''} onChange={(e) => handleChange('pix_key', e.target.value)} />
          </div>
          <ImageUploadField label="QR Code do PIX (Imagem)" field="pix_qrcode_url" currentUrl={formData.pix_qrcode_url} />
        </TabsContent>
      </Tabs>
    </form>
  );
}