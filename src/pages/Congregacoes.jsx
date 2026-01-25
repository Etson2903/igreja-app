import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation, Church } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Congregacoes() {
  const [viewMode, setViewMode] = useState('list');

  const { data: churchInfo } = useQuery({
    queryKey: ['churchInfo'],
    queryFn: async () => {
      const list = await base44.entities.ChurchInfo.list();
      return list[0] || null;
    }
  });

  const { data: congregations = [], isLoading } = useQuery({
    queryKey: ['congregations'],
    queryFn: () => base44.entities.Congregation.filter({ is_active: true }, 'name', 100)
  });

  const openMaps = (congregation) => {
    if (congregation.latitude && congregation.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${congregation.latitude},${congregation.longitude}`, '_blank');
    } else if (congregation.address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(congregation.address)}`, '_blank');
    }
  };

  const mapCenter = congregations.length > 0 && congregations[0].latitude
    ? [congregations[0].latitude, congregations[0].longitude]
    : churchInfo?.latitude && churchInfo?.longitude
      ? [churchInfo.latitude, churchInfo.longitude]
      : [-15.7801, -47.9292];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <PageHeader
          title="Congregações"
          subtitle="Encontre uma congregação perto de você"
          action={
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                Mapa
              </button>
            </div>
          }
        />

        {churchInfo?.address && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white mb-6 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <Church className="w-5 h-5" />
              <span className="font-semibold">Sede Principal</span>
            </div>
            <h3 className="text-lg font-bold mb-2">{churchInfo.name}</h3>
            <p className="text-amber-100 text-sm mb-3">{churchInfo.address}</p>
            <Button
              onClick={() => openMaps({ latitude: churchInfo.latitude, longitude: churchInfo.longitude, address: churchInfo.address })}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Como Chegar
            </Button>
          </motion.div>
        )}

        {congregations.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Nenhuma congregação cadastrada"
            description="As congregações da igreja aparecerão aqui."
          />
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {congregations.map((congregation, index) => (
              <motion.div
                key={congregation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex gap-4">
                  {congregation.photo_url ? (
                    <img
                      src={congregation.photo_url}
                      alt={congregation.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                      <Church className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{congregation.name}</h3>
                    {congregation.neighborhood && (
                      <p className="text-sm text-amber-600 font-medium">{congregation.neighborhood}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{congregation.address}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openMaps(congregation)}
                        className="rounded-lg text-xs h-8"
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Rota
                      </Button>
                      {congregation.pastor_phone && (
                        <a
                          href={`tel:${congregation.pastor_phone}`}
                          className="inline-flex items-center gap-1 px-3 h-8 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          Ligar
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {(congregation.pastor_name || congregation.service_times) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
                    {congregation.pastor_name && (
                      <span>Pastor: {congregation.pastor_name}</span>
                    )}
                    {congregation.service_times && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {congregation.service_times}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden shadow-lg h-[400px]">
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {congregations.filter(c => c.latitude && c.longitude).map(congregation => (
                <Marker
                  key={congregation.id}
                  position={[congregation.latitude, congregation.longitude]}
                >
                  <Popup>
                    <div className="text-sm">
                      <h4 className="font-semibold">{congregation.name}</h4>
                      <p className="text-gray-500 text-xs mt-1">{congregation.address}</p>
                      <button
                        onClick={() => openMaps(congregation)}
                        className="mt-2 text-amber-600 text-xs font-medium"
                      >
                        Ver rota →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
}
