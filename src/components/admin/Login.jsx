import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Loader2, Lock, Mail, Church, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Bem-vindo de volta!');
      
    } catch (error) {
      console.error(error);
      toast.error('Erro ao entrar: Verifique email e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      {/* Background Decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center mb-10">
              <motion.div 
                initial={{ rotate: -10 }}
                animate={{ rotate: 3 }}
                className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20"
              >
                <Church className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Painel AD</h1>
              <p className="text-gray-500 mt-2 font-medium text-center">Gestão Administrativa do Ministério</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-semibold ml-1">E-mail</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@igreja.com" 
                    className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" title="password" className="text-gray-700 font-semibold">Senha</Label>
                  <button type="button" className="text-xs font-bold text-primary hover:underline">Esqueceu?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/25 group transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Acessar Painel
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </div>
          
          <div className="bg-gray-50/80 p-6 text-center border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Segurança Criptografada &bull; © 2024
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
