import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function EntityForm({ 
  isOpen, 
  onClose, 
  onSave, 
  fields, 
  initialData = null,
  title,
  isSaving = false
}) {
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const defaults = {};
      fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaults[field.name] = field.defaultValue;
        }
      });
      setFormData(defaults);
    }
  }, [initialData, fields, isOpen]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (field, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [field]: true }));
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(fileName);

      handleChange(field, publicUrl);
      toast.success('Imagem enviada com sucesso!');

    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar imagem.');
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // CORREÇÃO DE DATA: Garante que datas sejam enviadas como YYYY-MM-DD string pura
    // Isso evita que o new Date() subtraia horas pelo fuso horário
    const dataToSave = { ...formData };
    
    fields.forEach(field => {
        if (field.type === 'date' && dataToSave[field.name]) {
            // Se já for string YYYY-MM-DD, mantém. Se for objeto Date, formata.
            // O input type="date" já retorna YYYY-MM-DD, então geralmente não precisa mexer.
            // O problema costuma ser na exibição ou na conversão automática do banco.
            // Vamos garantir que seja string.
            dataToSave[field.name] = String(dataToSave[field.name]).split('T')[0];
        }
    });

    onSave(dataToSave);
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            step={field.step || 1}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, field.step ? parseFloat(e.target.value) : parseInt(e.target.value))}
            placeholder={field.placeholder}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
          />
        );

      case 'select':
        return (
          <Select
            value={formData[field.name] || ''}
            onValueChange={(value) => handleChange(field.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Selecione...'} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={formData[field.name] || false}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
            />
            <span className="text-sm text-gray-600">{field.switchLabel || 'Ativo'}</span>
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            // CORREÇÃO DE DATA NA EXIBIÇÃO: Pega só a parte YYYY-MM-DD
            value={formData[field.name] ? String(formData[field.name]).split('T')[0] : ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );

      case 'time':
        return (
          <Input
            type="time"
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );

      case 'image':
        return (
          <div className="space-y-3">
            {formData[field.name] ? (
              <div className="relative w-32 h-32 group">
                <img 
                  src={formData[field.name]} 
                  alt="Preview" 
                  className="w-full h-full rounded-lg object-cover border border-gray-200 shadow-sm"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Alterar</span>
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                <span className="text-gray-400 text-xs text-center px-2">Sem imagem</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(field.name, e.target.files[0])}
                  disabled={uploading[field.name]}
                  className="hidden"
                  id={`file-${field.name}`}
                />
                <Label 
                  htmlFor={`file-${field.name}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                    uploading[field.name] 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {uploading[field.name] ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Escolher Imagem
                    </>
                  )}
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <Input
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">Preencha os dados abaixo</p>
              </div>
              <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50/50">
                {fields.map((field) => (
                  <div key={field.name} className={`space-y-2 ${field.className || ''}`}>
                    <Label htmlFor={field.name} className="text-gray-700 font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderField(field)}
                    {field.description && (
                      <p className="text-xs text-gray-500">{field.description}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-gray-100 bg-white flex gap-3">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">Cancelar</Button>
                <Button type="submit" disabled={isSaving || Object.values(uploading).some(Boolean)} className="flex-1 bg-amber-500 hover:bg-amber-600 h-11 text-base font-medium">
                  {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  Salvar
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
