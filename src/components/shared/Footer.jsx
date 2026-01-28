import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const { data: info } = useQuery({
    queryKey: ['churchInfo'],
    queryFn: async () => {
      const { data } = await supabase.from('church_info').select('*').single();
      return data || {};
    }
  });

  if (!info) return null;

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 mt-12 rounded-t-3xl">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-6">
          
          {/* Logo e Nome */}
          <div>
            <h3 className="text-2xl font-bold text-amber-500">{info.name || 'Nossa Igreja'}</h3>
            <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
              {info.description || 'Levando a palavra de Deus para todos os corações.'}
            </p>
          </div>

          {/* Redes Sociais (Destaque) */}
          <div className="flex gap-6">
            {info.instagram_url && (
              <a href={info.instagram_url} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-3 rounded-full hover:bg-pink-600 transition-colors group">
                <Instagram className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </a>
            )}
            {info.facebook_url && (
              <a href={info.facebook_url} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-3 rounded-full hover:bg-blue-600 transition-colors group">
                <Facebook className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </a>
            )}
            {info.youtube_channel_id && (
              <a href={`https://www.youtube.com/channel/${info.youtube_channel_id}`} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-3 rounded-full hover:bg-red-600 transition-colors group">
                <Youtube className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </a>
            )}
          </div>

          {/* Contato Rápido */}
          <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-400 mt-4">
            {info.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {info.address}</div>}
            {info.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {info.phone}</div>}
          </div>

          <div className="w-full border-t border-gray-800 pt-8 mt-4">
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} {info.name}. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
