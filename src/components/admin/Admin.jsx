import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Loader2, Plus, Trash2, Save, LogOut, Upload, 
  Building2, Calendar, Newspaper, Users, MapPin, QrCode, Edit, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('church');
  
  // --- ESTADOS DE DADOS ---
  const [churchInfo, setChurchInfo] = useState({});
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [congregations, setCongregations] = useState([]);

  // --- ESTADOS DE FORMULÁRIOS ---
  // Estado de Edição de Evento
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '', description: '', date: '', end_date: '',
    start_time: '', end_time: '', location: '', event_type: '', image_url: '',
    is_recurring: false, recurrence_day: 'sunday', is_active: true
  });

  const [newNews, setNewNews] = useState({
    title: '', summary: '', content: '', author: '', 
    category: 'noticia', image_url: '', is_highlighted: false, is_published: true
  });

  const [newLeader, setNewLeader] = useState({
    name: '', role: '', leader_type: 'lider_departamento', 
    bio: '', photo_url: '', whatsapp: '', phone: '', email: '', order: 0
  });

  const [newCongregation, setNewCongregation] = useState({
    name: '', address: '', neighborhood: '', photo_url: '',
    pastor_name: '', pastor_phone: '', service_times: '', 
    latitude: '', longitude: '', is_active: true
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
      setLoading(true);
      const [infoRes, eventsRes, newsRes, leadersRes, congRes] = await Promise.all([
        supabase.from('church_info').select('*').single(),
        supabase.from('events').select('*').order('date', { ascending: true }),
        supabase.from('news').select('*').order('created_at', { ascending: false }),
        supabase.from('leaders').select('*').order('name'),
        supabase.from('congregations').select('*').order('name')
      ]);

      if (infoRes.data) setChurchInfo(infoRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
      if (newsRes.data) setNews(newsRes.data);
      if (leadersRes.data) setLeaders(leadersRes.data);
      if (congRes.data) setCongregations(congRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- UPLOAD GENÉRICO ---
  const handleUpload = async (e, bucket, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      callback(publicUrl);
      toast.success('Upload concluído!');
    } catch (error) {
      toast.error('Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  // --- FUNÇÕES DE EVENTOS (CRIAR / EDITAR / DELETAR) ---
  
  const startEditingEvent = (event) => {
    setEditingEventId(event.id);
    setEventForm({ ...event }); // Preenche formulário com dados do evento
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sobe a tela
  };

  const cancelEditingEvent = () => {
    setEditingEventId(null);
    setEventForm({
      title: '', description: '', date: '', end_date: '',
      start_time: '', end_time: '', location: '', event_type: '', image_url: '',
      is_recurring: false, recurrence_day: 'sunday', is_active: true
    });
  };

  const saveEvent = async (e) => {
    e.preventDefault();
    const eventToSave = { ...eventForm };
    if (!eventToSave.end_date) delete eventToSave.end_date;
    
    let error;
    
    if (editingEventId) {
      // ATUALIZAR (UPDATE)
      const { error: updateError } = await supabase
        .from('events')
        .update(eventToSave)
        .eq('id', editingEventId);
      error = updateError;
    } else {
      // CRIAR (INSERT)
      const { error: insertError } = await supabase
        .from('events')
        .insert([eventToSave]);
      error = insertError;
    }

    if (!error) {
      toast.success(editingEventId ? 'Evento atualizado!' : 'Evento criado!');
      fetchData();
      cancelEditingEvent(); // Limpa formulário
    } else {
      toast.error('Erro ao salvar evento');
    }
  };

  const deleteEvent = async (id) => {
    if(confirm('Tem certeza que deseja excluir este evento?')) {
      await supabase.from('events').delete().eq('id', id);
      fetchData();
    }
  };

  // --- OUTRAS FUNÇÕES DE SALVAR (IGREJA, NOTÍCIAS...) ---
  const saveChurchInfo = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('church_info').upsert(churchInfo);
    if (!error) toast.success('Dados salvos!');
  };

  const saveNews = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('news').insert([newNews]);
    if (!error) { toast.success('Notícia publicada!'); fetchData(); setNewNews({...newNews, title: ''}); }
  };
  const deleteNews = async (id) => { if(confirm('Excluir?')) { await supabase.from('news').delete().eq('id', id); fetchData(); }};

  const saveLeader = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('leaders').insert([newLeader]);
    if (!error) { toast.success('Líder salvo!'); fetchData(); setNewLeader({...newLeader, name: ''}); }
  };
  const deleteLeader = async (id) => { if(confirm('Excluir?')) { await supabase.from('leaders').delete().eq('id', id); fetchData(); }};

  const saveCongregation = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('congregations').insert([newCongregation]);
    if (!error) { toast.success('Congregação salva!'); fetchData(); setNewCongregation({...newCongregation, name: ''}); }
  };
  const deleteCongregation = async (id) => { if(confirm('Excluir?')) { await supabase.from('congregations').delete().eq('id', id); fetchData(); }};

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/'); };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-600" /> 
            Painel Administrativo
          </h1>
          <Button variant="destructive" onClick={handleLogout} size="sm">
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>

        {/* TABS DE NAVEGAÇÃO */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1 bg-white border shadow-sm rounded-xl">
            <TabsTrigger value="church" className="py-3 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              <Building2 className="w-4 h-4 mr-2" /> Igreja
            </TabsTrigger>
            <TabsTrigger value="events" className="py-3 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              <Calendar className="w-4 h-4 mr-2" /> Agenda
            </TabsTrigger>
            <TabsTrigger value="news" className="py-3 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              <Newspaper className="w-4 h-4 mr-2" /> Notícias
            </TabsTrigger>
            <TabsTrigger value="leaders" className="py-3 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              <Users className="w-4 h-4 mr-2" /> Liderança
            </TabsTrigger>
            <TabsTrigger value="congregations" className="py-3 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
              <MapPin className="w-4 h-4 mr-2" /> Congregações
            </TabsTrigger>
          </TabsList>

          {/* 1. ABA IGREJA */}
          <TabsContent value="church" className="mt-6 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-bold mb-4">Dados Gerais</h2>
              <form onSubmit={saveChurchInfo} className="grid md:grid-cols-2 gap-4">
                <div><Label>Nome</Label><Input value={churchInfo.name || ''} onChange={e => setChurchInfo({...churchInfo, name: e.target.value})} /></div>
                <div><Label>Telefone</Label><Input value={churchInfo.phone || ''} onChange={e => setChurchInfo({...churchInfo, phone: e.target.value})} /></div>
                <div className="col-span-2"><Label>Endereço</Label><Input value={churchInfo.address || ''} onChange={e => setChurchInfo({...churchInfo, address: e.target.value})} /></div>
                <div className="col-span-2"><Label>Descrição</Label><Textarea value={churchInfo.description || ''} onChange={e => setChurchInfo({...churchInfo, description: e.target.value})} /></div>
                
                <div className="col-span-2 border-t pt-4 mt-2">
                  <Label>Banner Principal</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <Input value={churchInfo.banner_url || ''} readOnly />
                    <label className="cursor-pointer bg-gray-100 p-2 rounded hover:bg-gray-200">
                      <input type="file" hidden onChange={(e) => handleUpload(e, 'church-assets', (url) => setChurchInfo({...churchInfo, banner_url: url}))} />
                      <Upload className="w-4 h-4" />
                    </label>
                  </div>
                </div>

                <div className="col-span-2 border-t pt-4 mt-2">
                  <h3 className="font-bold mb-2">Dados Bancários & PIX</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label>Chave PIX</Label><Input value={churchInfo.pix_key || ''} onChange={e => setChurchInfo({...churchInfo, pix_key: e.target.value})} /></div>
                    <div><Label>Banco</Label><Input value={churchInfo.bank_name || ''} onChange={e => setChurchInfo({...churchInfo, bank_name: e.target.value})} /></div>
                    <div><Label>Agência</Label><Input value={churchInfo.bank_agency || ''} onChange={e => setChurchInfo({...churchInfo, bank_agency: e.target.value})} /></div>
                    <div><Label>Conta</Label><Input value={churchInfo.bank_account || ''} onChange={e => setChurchInfo({...churchInfo, bank_account: e.target.value})} /></div>
                    <div><Label>Titular</Label><Input value={churchInfo.bank_holder || ''} onChange={e => setChurchInfo({...churchInfo, bank_holder: e.target.value})} /></div>
                    <div>
                      <Label>QR Code PIX</Label>
                      <div className="flex gap-2 items-center mt-1">
                        <Input value={churchInfo.pix_qrcode_url || ''} readOnly />
                        <label className="cursor-pointer bg-gray-100 p-2 rounded hover:bg-gray-200">
                          <input type="file" hidden onChange={(e) => handleUpload(e, 'church-assets', (url) => setChurchInfo({...churchInfo, pix_qrcode_url: url}))} />
                          <QrCode className="w-4 h-4" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-2"><Button type="submit" className="w-full bg-amber-600">Salvar Alterações</Button></div>
              </form>
            </div>
          </TabsContent>

          {/* 2. ABA AGENDA (COM EDIÇÃO E BANNER) */}
          <TabsContent value="events" className="mt-6 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  {editingEventId ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-amber-600" />}
                  {editingEventId ? 'Editar Evento' : 'Novo Evento'}
                </h2>
                {editingEventId && (
                  <Button variant="outline" size="sm" onClick={cancelEditingEvent}>
                    <X className="w-4 h-4 mr-2" /> Cancelar Edição
                  </Button>
                )}
              </div>

              <form onSubmit={saveEvent} className="grid md:grid-cols-2 gap-4">
                <div className="col-span-2"><Label>Título</Label><Input required value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} /></div>
                
                <div className="col-span-2 flex items-center gap-2 bg-gray-50 p-2 rounded">
                  <Switch checked={eventForm.is_recurring} onCheckedChange={c => setEventForm({...eventForm, is_recurring: c})} />
                  <Label>Evento Recorrente?</Label>
                </div>

                {eventForm.is_recurring ? (
                  <div className="col-span-2">
                    <Label>Dia da Semana</Label>
                    <select className="w-full p-2 border rounded" value={eventForm.recurrence_day} onChange={e => setEventForm({...eventForm, recurrence_day: e.target.value})}>
                      <option value="sunday">Domingo</option>
                      <option value="monday">Segunda</option>
                      <option value="wednesday">Quarta</option>
                      <option value="saturday">Sábado</option>
                    </select>
                  </div>
                ) : (
                  <>
                    <div><Label>Data Início</Label><Input type="date" required value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} /></div>
                    <div><Label>Data Fim (Opcional)</Label><Input type="date" value={eventForm.end_date} onChange={e => setEventForm({...eventForm, end_date: e.target.value})} /></div>
                  </>
                )}

                <div><Label>Hora Início</Label><Input type="time" required value={eventForm.start_time} onChange={e => setEventForm({...eventForm, start_time: e.target.value})} /></div>
                <div><Label>Hora Fim</Label><Input type="time" value={eventForm.end_time} onChange={e => setEventForm({...eventForm, end_time: e.target.value})} /></div>
                <div><Label>Local</Label><Input value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} /></div>
                <div><Label>Tipo (Culto, Jovem...)</Label><Input value={eventForm.event_type} onChange={e => setEventForm({...eventForm, event_type: e.target.value})} /></div>
                <div className="col-span-2"><Label>Descrição</Label><Textarea value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} /></div>
                
                {/* Upload de Banner do Evento */}
                <div className="col-span-2 border-t pt-4 mt-2">
                  <Label>Banner / Cartaz do Evento (Opcional)</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <Input value={eventForm.image_url || ''} readOnly placeholder="URL da imagem" />
                    <label className="cursor-pointer bg-gray-100 p-2 rounded hover:bg-gray-200">
                      <input type="file" hidden onChange={(e) => handleUpload(e, 'church-assets', (url) => setEventForm({...eventForm, image_url: url}))} />
                      <Upload className="w-4 h-4" />
                    </label>
                  </div>
                  {eventForm.image_url && (
                    <img src={eventForm.image_url} alt="Preview" className="h-20 mt-2 rounded border" />
                  )}
                </div>
                
                <div className="col-span-2">
                  <Button type="submit" className={`w-full ${editingEventId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                    {editingEventId ? 'Salvar Alterações' : 'Adicionar Evento'}
                  </Button>
                </div>
              </form>
            </div>

            <div className="space-y-2">
              {events.map(ev => (
                <div key={ev.id} className={`flex justify-between items-center p-3 border rounded shadow-sm ${editingEventId === ev.id ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                  <div className="flex items-center gap-3">
                    {ev.image_url && <img src={ev.image_url} className="w-10 h-10 rounded object-cover" />}
                    <div>
                      <p className="font-bold">{ev.title}</p>
                      <p className="text-xs text-gray-500">{ev.is_recurring ? `Todo(a) ${ev.recurrence_day}` : ev.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="text-blue-600 hover:bg-blue-50" onClick={() => startEditingEvent(ev)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => deleteEvent(ev.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 3. ABA NOTÍCIAS (Mantida igual) */}
          <TabsContent value="news" className="mt-6 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-bold mb-4">Nova Notícia</h2>
              <form onSubmit={saveNews} className="grid md:grid-cols-2 gap-4">
                <div className="col-span-2"><Label>Título</Label><Input required value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} /></div>
                <div><Label>Categoria</Label><select className="w-full p-2 border rounded" value={newNews.category} onChange={e => setNewNews({...newNews, category: e.target.value})}><option value="noticia">Notícia</option><option value="aviso">Aviso</option><option value="devocional">Devocional</option><option value="estudo">Estudo</option></select></div>
                <div><Label>Autor</Label><Input value={newNews.author} onChange={e => setNewNews({...newNews, author: e.target.value})} /></div>
                <div className="col-span-2"><Label>Resumo</Label><Input value={newNews.summary} onChange={e => setNewNews({...newNews, summary: e.target.value})} /></div>
                <div className="col-span-2"><Label>Conteúdo</Label><Textarea className="h-32" value={newNews.content} onChange={e => setNewNews({...newNews, content: e.target.value})} /></div>
                <div className="col-span-2"><Label>Imagem</Label><div className="flex gap-2 items-center mt-1"><Input value={newNews.image_url || ''} readOnly /><label className="cursor-pointer bg-gray-100 p-2 rounded hover:bg-gray-200"><input type="file" hidden onChange={(e) => handleUpload(e, 'church-assets', (url) => setNewNews({...newNews, image_url: url}))} /><Upload className="w-4 h-4" /></label></div></div>
                <div className="col-span-2 flex items-center gap-2"><Switch checked={newNews.is_highlighted} onCheckedChange={c => setNewNews({...newNews, is_highlighted: c})} /><Label>Destaque?</Label></div>
                <div className="col-span-2"><Button type="submit" className="w-full">Publicar</Button></div>
              </form>
            </div>
            <div className="space-y-2">{news.map(item => (<div key={item.id} className="flex justify-between p-3 bg-white border rounded shadow-sm"><div><p className="font-bold">{item.title}</p><p className="text-xs text-gray-500 uppercase">{item.category}</p></div><Button size="icon" variant="ghost" className="text-red-500" onClick={() => deleteNews(item.id)}><Trash2 className="w-4 h-4" /></Button></div>))}</div>
          </TabsContent>

          {/* 4. ABA LIDERANÇA (Mantida igual) */}
          <TabsContent value="leaders" className="mt-6 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-bold mb-4">Novo Líder</h2>
              <form onSubmit={saveLeader} className="grid md:grid-cols-2 gap-4">
                <div><Label>Nome</Label><Input required value={newLeader.name} onChange={e => setNewLeader({...newLeader, name: e.target.value})} /></div>
                <div><Label>Cargo</Label><Input required value={newLeader.role} onChange={e => setNewLeader({...newLeader, role: e.target.value})} /></div>
                <div><Label>Tipo</Label><select className="w-full p-2 border rounded" value={newLeader.leader_type} onChange={e => setNewLeader({...newLeader, leader_type: e.target.value})}><option value="diretoria">Diretoria</option><option value="pastor">Pastor</option><option value="lider_departamento">Líder</option></select></div>
                <div><Label>WhatsApp</Label><Input value={newLeader.whatsapp} onChange={e => setNewLeader({...newLeader, whatsapp: e.target.value})} /></div>
                <div className="col-span-2"><Label>Foto</Label><div className="flex gap-2 items-center mt-1"><Input value={newLeader.photo_url || ''} readOnly /><label className="cursor-pointer bg-gray-100 p-2 rounded hover:bg-gray-200"><input type="file" hidden onChange={(e) => handleUpload(e, 'church-assets', (url) => setNewLeader({...newLeader, photo_url: url}))} /><Upload className="w-4 h-4" /></label></div></div>
                <div className="col-span-2"><Button type="submit" className="w-full">Salvar</Button></div>
              </form>
            </div>
            <div className="space-y-2">{leaders.map(l => (<div key={l.id} className="flex justify-between p-3 bg-white border rounded shadow-sm"><div><p className="font-bold">{l.name}</p><p className="text-xs text-gray-500">{l.role}</p></div><Button size="icon" variant="ghost" className="text-red-500" onClick={() => deleteLeader(l.id)}><Trash2 className="w-4 h-4" /></Button></div>))}</div>
          </TabsContent>

          {/* 5. ABA CONGREGAÇÕES (Mantida igual) */}
          <TabsContent value="congregations" className="mt-6 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-bold mb-4">Nova Congregação</h2>
              <form onSubmit={saveCongregation} className="grid md:grid-cols-2 gap-4">
                <div><Label>Nome</Label><Input required value={newCongregation.name} onChange={e => setNewCongregation({...newCongregation, name: e.target.value})} /></div>
                <div><Label>Bairro</Label><Input value={newCongregation.neighborhood} onChange={e => setNewCongregation({...newCongregation, neighborhood: e.target.value})} /></div>
                <div className="col-span-2"><Label>Endereço</Label><Input value={newCongregation.address} onChange={e => setNewCongregation({...newCongregation, address: e.target.value})} /></div>
                <div><Label>Dirigente</Label><Input value={newCongregation.pastor_name} onChange={e => setNewCongregation({...newCongregation, pastor_name: e.target.value})} /></div>
                <div><Label>Telefone</Label><Input value={newCongregation.pastor_phone} onChange={e => setNewCongregation({...newCongregation, pastor_phone: e.target.value})} /></div>
                <div className="col-span-2"><Label>Horários</Label><Input value={newCongregation.service_times} onChange={e => setNewCongregation({...newCongregation, service_times: e.target.value})} /></div>
                <div className="col-span-2"><Button type="submit" className="w-full">Salvar</Button></div>
              </form>
            </div>
            <div className="space-y-2">{congregations.map(c => (<div key={c.id} className="flex justify-between p-3 bg-white border rounded shadow-sm"><div><p className="font-bold">{c.name}</p><p className="text-xs text-gray-500">{c.neighborhood}</p></div><Button size="icon" variant="ghost" className="text-red-500" onClick={() => deleteCongregation(c.id)}><Trash2 className="w-4 h-4" /></Button></div>))}</div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
