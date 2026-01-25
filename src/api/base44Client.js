import { supabase } from '@/lib/supabase';

// Funções auxiliares para buscar dados
const fetchTable = async (table, orderBy = 'created_at', limit = 100, filters = {}) => {
  let query = supabase
    .from(table)
    .select('*')
    .order(orderBy.replace('-', ''), { ascending: !orderBy.startsWith('-') })
    .limit(limit);

  // Aplica filtros se existirem
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });

  const { data, error } = await query;
  
  if (error) {
    console.error(`Erro ao buscar ${table}:`, error);
    return [];
  }
  
  return data || [];
};

export const base44 = {
  entities: {
    ChurchInfo: { 
      list: async () => fetchTable('church_info') 
    },
    Event: { 
      filter: async (filters, orderBy, limit) => fetchTable('events', orderBy || 'date', limit, filters) 
    },
    News: { 
      filter: async (filters, orderBy, limit) => fetchTable('news', orderBy || '-created_date', limit, filters) 
    },
    Video: { 
      filter: async (filters, orderBy, limit) => fetchTable('videos', orderBy || '-created_at', limit, filters) 
    },
    Leader: { 
      filter: async (filters, orderBy, limit) => fetchTable('leaders', orderBy || 'order', limit, filters) 
    },
    Congregation: { 
      filter: async (filters, orderBy, limit) => fetchTable('congregations', orderBy || 'name', limit, filters) 
    },
    Department: { 
      filter: async (filters, orderBy, limit) => fetchTable('departments', orderBy || 'order', limit, filters) 
    },
  }
};
