/**
 * Configuración del cliente Supabase para React Native
 * 
 * IMPORTANTE: En el frontend usamos ANON KEY (pública)
 * - El backend usa SERVICE_ROLE_KEY para operaciones administrativas
 * - El frontend usa ANON_KEY + JWT del backend para autenticación
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = 'https://endtgngduxyxdyponecx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZHRnbmdkdXh5eGR5cG9uZWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NzU1OTIsImV4cCI6MjA1NTE1MTU5Mn0.vVBHXlASkm6fO-VqEP5-7GRGtlZXpvO5MpkPZfZpTms';

// Crear cliente de Supabase para el frontend
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // No usar Auth de Supabase, usamos JWT del backend
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

console.log('✅ Supabase client configurado en frontend (modo público)');

export default supabase;
