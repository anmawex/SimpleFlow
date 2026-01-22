import { supabase } from '@/supabase';
import { ref } from 'vue';

export function useSupabaseCrud(tableName) {
    const items = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchAll = async () => {
        loading.value = true;
        error.value = null;
        try {
            // Asumimos que la tabla tiene created_at, si no, se puede quitar el order o hacerlo opcional
            const { data, error: err } = await supabase
                .from(tableName)
                .select('*')
                // .order('created_at', { ascending: false }); // Descomentar si tienes columna created_at

            if (err) throw err;
            items.value = data || [];
        } catch (err) {
            error.value = err.message;
            console.error(`Error fetching ${tableName}:`, err);
        } finally {
            loading.value = false;
        }
    };

    const create = async (record) => {
        loading.value = true;
        error.value = null;
        try {
            // Excluir id si es null/undefined/vacío para que la DB lo genere
            const payload = { ...record };
            if (!payload.id) delete payload.id;

            const { data, error: err } = await supabase
                .from(tableName)
                .insert(payload)
                .select()
                .single();

            if (err) throw err;
            // Agregamos al inicio de la lista local
            items.value.unshift(data);
            return data;
        } catch (err) {
            error.value = err.message;
            console.error(`Error creating in ${tableName}:`, err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const update = async (id, updates) => {
        loading.value = true;
        error.value = null;
        try {
            const { data, error: err } = await supabase
                .from(tableName)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (err) throw err;
            
            // Actualizamos la lista local
            const index = items.value.findIndex((item) => item.id === id);
            if (index !== -1) items.value[index] = data;
            
            return data;
        } catch (err) {
            error.value = err.message;
            console.error(`Error updating in ${tableName}:`, err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const remove = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            const { error: err } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id);

            if (err) throw err;
            
            // Removemos de la lista local
            items.value = items.value.filter((item) => item.id !== id);
        } catch (err) {
            error.value = err.message;
            console.error(`Error deleting from ${tableName}:`, err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        items,
        loading,
        error,
        fetchAll,
        create,
        update,
        remove
    };
}
