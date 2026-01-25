import React from 'react';
import { motion } from 'framer-motion';

export default function HeroBanner({ churchInfo }) {
  const bannerUrl = churchInfo?.banner_url || churchInfo?.facade_photo_url;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-64 md:h-80 overflow-hidden rounded-2xl"
    >
      {bannerUrl ? (
        <img 
          src={bannerUrl} 
          alt={churchInfo?.name || 'Igreja'}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900" />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-end gap-4">
          {churchInfo?.logo_url && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/95 p-2 shadow-lg backdrop-blur-sm"
            >
              <img 
                src={churchInfo.logo_url} 
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>
          )}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight">
              {churchInfo?.name || 'Assembleia de Deus'}
            </h1>
            {churchInfo?.address && (
              <p className="text-white/80 text-sm mt-1 line-clamp-1">
                {churchInfo.address}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
