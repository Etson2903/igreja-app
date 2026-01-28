import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Save, LogOut, Upload, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [churchInfo, setChurchInfo] = useState({
    name: '', description: '', address: '', phone: '', 
    banner_url: '', pix_key: '', pix_qrcode_url: ''
  });
  
  // Estado do Formulário de Evento
  const [newEvent, setNewEvent] = useState({
    title: '', description: '', date: '', end_date: '', // Adicionado end_date
    start_time: '', end_time: '', location: '', event_type: '',
    is_recurring: false, recurrence_day: 'sunday', is_active: true
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate('/login');
  };

  const fetchData = async () => {
    try {
      const [eventsRes, infoRes] = await Promise.all([
        supabase.from('events').select('*').order('date', { ascending: true }),
        supabase.from('church_info').select('*').single()
      ]);

      if (eventsRes.data) setEvents(eventsRes.data);
      if (infoRes.data) setChurchInfo(infoRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('events').insert([newEvent]);
      if (error) throw error;
      toast.success('Evento criado com sucesso!');
      fetchData();
      // Limpa formulário
      setNewEvent({
        title: '', description: '', date: '', end_date: '',
        start_time: '', end_time: '', location: '', event_type: '',
        is_recurring: false, recurrence_day: 'sunday', is_active: true
      });
    } catch (error) {
      toast.error('Erro ao criar evento');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      await supabase.from('events').delete().eq('id', id);
      toast.success('Evento excluído');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const handleUpdateChurchInfo = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('church_info').upsert(churchInfo);
      if (error) throw error;
      toast.success('Informações atualizadas!');
    } catch (error) {
      toast.error('Erro ao atualizar informações');
    }
  };

  // Upload de Imagem (Banner ou QR Code)
  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${field}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('church-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('church-assets')
        .getPublicUrl(filePath);

      setChurchInfo(prev => ({ ...prev, [field]: publicUrl }));
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar imagem');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <Button variant="destructive" onClick={handleLogout} size="sm">
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>

        {/* Informações da Igreja */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Save className="w-5 h-5 text-amber-600" /> Dados da Igreja
          </h2>
          <form onSubmit={handleUpdateChurchInfo} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome da Igreja</Label>
                <Input value={churchInfo.name} onChange={e => setChurchInfo({...churchInfo, name: e.target.value})} />
              </div>
              <div>
                <Label>Telefone / WhatsApp</Label>
                <Input value={churchInfo.phone} onChange={e => setChurchInfo({...churchInfo, phone: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <Label>Endereço</Label>
                <Input value={churchInfo.address} onChange={e => setChurchInfo({...churchInfo, address: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <Label>Descrição / Frase</Label>
                <Textarea value={churchInfo.description} onChange={e => setChurchInfo({...churchInfo, description: e.target.value})} />
              </div>
              
              {/* Upload de Banner */}
              <div>
                <Label>Banner Principal (URL)</Label>
                <div className="flex gap-2">
                  <Input value={churchInfo.banner_url || ''} readOnly placeholder="Faça upload da imagem" />
                  <label className="cursor-pointer">
                    <input type="file" hidden onChange={(e) => handleUpload(e, 'banner_url')} accept="image/*" />
                    <div className="bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition">
                      {uploading ? <Loader2 className="animate-spin w-5 h-5" /> : <Upload className="w-5 h-5" />}
                    </div>
                  </label>
                </div>
              </div>

              {/* Upload de QR Code PIX */}
              <div>
                <Label>QR Code PIX (Ofertas)</Label>
                <div className="flex gap-2">
                  <Input value={churchInfo.pix_qrcode_url || ''} readOnly placeholder="Faça upload do QR Code" />
                  <label className="cursor-pointer">
                    <input type="file" hidden onChange={(e) => handleUpload(e, 'pix_qrcode_url')} accept="image/*" />
                    <div className="bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition">
                      {uploading ? <Loader2 className="animate-spin w-5 h-5" /> : <QrCode className="w-5 h-5" />}
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">Salvar Informações</Button>
          </form>
        </div>

        {/* Gerenciamento de Eventos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-600" /> Novo Evento
          </h2>
          
          <form onSubmit={handleCreateEvent} className="space-y-4 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Título do Evento</Label>
                <Input required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              </div>
              
              <div className="flex items-center space-x-2 md:col-span-2 bg-gray-50 p-3 rounded-lg">
                <Switch 
                  id="recurring" 
                  checked={newEvent.is_recurring}
                  onCheckedChange={(checked) => setNewEvent({...newEvent, is_recurring: checked})}
                />
                <Label htmlFor="recurring">Evento Recorrente (Repete toda semana?)</Label>
              </div>

              {newEvent.is_recurring ? (
                <div className="md:col-span-2">
                  <Label>Dia da Semana</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={newEvent.recurrence_day}
                    onChange={e => setNewEvent({...newEvent, recurrence_day: e.target.value})}
                  >
                    <option value="sunday">Domingo</option>
                    <option value="monday">Segunda-feira</option>
                    <option value="tuesday">Terça-feira</option>
                    <option value="wednesday">Quarta-feira</option>
                    <option value="thursday">Quinta-feira</option>
                    <option value="friday">Sexta-feira</option>
                    <option value="saturday">Sábado</option>
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <Label>Data Inicial</Label>
                    <Input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                  </div>
                  <div>
                    <Label>Data Final (Opcional - Para congressos/retiros)</Label>
                    <Input type="date" value={newEvent.end_date} onChange={e => setNewEvent({...newEvent, end_date: e.target.value})} />
                  </div>
                </>
              )}

              <div>
                <Label>Horário Início</Label>
                <Input type="time" required value={newEvent.start_time} onChange={e => setNewEvent({...newEvent, start_time: e.target.value})} />
              </div>
              <div>
                <Label>Horário Fim (Opcional)</Label>
                <Input type="time" value={newEvent.end_time} onChange={e => setNewEvent({...newEvent, end_time: e.target.value})} />
              </div>
              
              <div>
                <Label>Local</Label>
                <Input value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} placeholder="Ex: Templo Sede" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Input value={newEvent.event_type} onChange={e => setNewEvent({...newEvent, event_type: e.target.value})} placeholder="Ex: Culto, Jovens, Mulheres" />
              </div>
              <div className="md:col-span-2">
                <Label>Descrição</Label>
                <Textarea value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
              </div>
            </div>
            <Button type="submit" className="w-full">Adicionar Evento</Button>
          </form>

          {/* Lista de Eventos */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Eventos Cadastrados</h3>
            {events.map(event => (
              <div key={event.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-bold">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {event.is_recurring 
                      ? `Todo(a) ${event.recurrence_day}` 
                      : `${event.date} ${event.end_date ? 'até ' + event.end_date : ''}`} • {event.start_time}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)} className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
