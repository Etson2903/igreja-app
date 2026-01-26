import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function EntityForm({ isOpen, onClose, onSave, fields, initialData = null, title, isSaving = false }) {
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const defaults = {};
      fields.forEach(field => {
        if (field.defaultValue !== undefined) defaults[field.name] = field.defaultValue;
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
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange(field, file_url);
      toast.success('Arquivo enviado!');
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text': case 'email': case 'url':
        return <Input type={field.type} value={formData[field.name] || ''} onChange={(e) => handleChange(field.name, e.target.value)} placeholder={field.placeholder} />;
      case 'number':
        return <Input type="number" step={field.step || 1} value={formData[field.name] || ''} onChange={(e) => handleChange(field.name, field.step ? parseFloat(e.target.value) : parseInt(e.target.value))} placeholder={field.placeholder} />;
      case 'textarea':
        return <Textarea value={formData[field.name] || ''} onChange={(e) => handleChange(field.name, e.target.value)} placeholder={field.placeholder} rows={field.rows || 3} />;
      case 'select':
        return (
          <Select value={formData[field.name] || ''} onValueChange={(value) => handleChange(field.name, value)}>
            <SelectTrigger><SelectValue placeholder={field.placeholder || 'Selecione...'} /></SelectTrigger>
            <SelectContent>{field.options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
          </Select>
        );
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Switch checked={formData[field.name] || false} onCheckedChange={(checked) => handleChange(field.name, checked)} />
            <span className="text-sm text-gray-600">{field.switchLabel || 'Ativo'}</span>
          </div>
        );
      case 'date':
        return <Input type="date" value={formData[field.name] || ''} onChange={(e) => handleChange(field.name, e.target.value)} />;
      case 'time':
        return <Input type="time" value={formData[field.name] || ''} onChange={(e) => handleChange(field.name, e.target.value)} />;
      case 'image':
        return (
          <div className="space-y-2">
            {formData[field.name] && <img src={formData[field.name]} alt="Preview" className="w-24 h-24 rounded-lg object-cover" />}
            <div className="flex items-center gap-2">
              <Input type="file" accept="image/*" onChange={(e) => handleUpload(field.name, e.target.files[0])} disabled={uploading[field.name]} />
              {uploading[field.name] && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
            </div>
          </div>
        );
      default: return <Input value={formData[field.name] || ''} onChange={(e) => handleChange(field.name, e.target.value)} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-50" />
          <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {fields.map((field) => (
                  <div key={field.name} className={`space-y-2 ${field.className || ''}`}>
                    <Label htmlFor={field.name}>{field.label} {field.required && <span className="text-red-500 ml-1">*</span>}</Label>
                    {renderField(field)}
                    {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 flex gap-3">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
                <Button type="submit" disabled={isSaving} className="flex-1 bg-amber-500 hover:bg-amber-600">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Salvar
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
