import { createClient } from '@supabase/supabase-js';

// --- Configuración del Cliente de Supabase ---
//
// Es crucial mantener estas claves en un archivo .env para seguridad.
// VITE_SUPABASE_URL y VITE_SUPABASE_KEY son las variables de entorno estándar para Vite.
//
// 1. Crea un archivo llamado .env en la raíz de tu proyecto.
// 2. Añade las siguientes líneas a tu archivo .env:
//    VITE_SUPABASE_URL="https://tu-proyecto-ref.supabase.co"
//    VITE_SUPABASE_KEY="tu-llave-anon-publica"

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;
const supabaseUrl = 'https://rxfmvvoxjllrauhdsyus.supabase.co';
const supabaseAnonKey = 'sb_publishable_eKv-Hh1hOhHUnaqgF9X2Lg_hRhBoNQ6';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing. Make sure to set them in your .env file.');
}

// Exporta el cliente para que pueda ser utilizado en cualquier parte de la app.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
