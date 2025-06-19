import { supabase } from '../utils/supabase';

// ------------------- TIPOS Y MODELOS DE DATOS -------------------

/**
 * Representa la estructura completa de un restaurante en la base de datos.
 */
export type Restaurant = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  logo: string | null;
  commune: string;
  street_number: number | null;
  city: string;
  street: string;
  manager_id: string;
};

/**
 * Define los datos necesarios para el formulario de creación de un nuevo restaurante.
 */
export type NewRestaurantData = {
  name: string;
  description: string;
  city: string;
  commune: string;
  street: string;
  streetNumber: string; // Como string porque viene de un <IonInput>
};

/**
 * Define los campos que se pueden actualizar en un restaurante.
 * Usamos `Partial` porque el usuario puede actualizar solo algunos campos a la vez.
 */
export type UpdateRestaurantData = Partial<{
  name: string;
  description: string;
  city: string;
  commune: string;
  street: string;
  street_number: number | null;
}>;


// ------------------- FUNCIONES DEL SERVICIO (API) -------------------

/**
 * Obtiene los detalles de un restaurante específico por su ID.
 */
export const getRestaurantById = async (restaurantId: string): Promise<Restaurant | null> => {
  if (!restaurantId) {
    console.error("No se proporcionó un ID de restaurante.");
    return null;
  }

  const { data, error } = await supabase
    .from('restaurant')
    .select('*')
    .eq('id', restaurantId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error(`Error al obtener el restaurante ${restaurantId}:`, error);
    }
    return null;
  }

  return data;
};

/**
 * Obtiene la lista de todos los restaurantes asociados al usuario autenticado.
 */
export const getUserRestaurants = async (): Promise<Restaurant[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  const { data, error } = await supabase
    .from('restaurant')
    .select('*')
    .eq('manager_id', user.id);

  if (error) {
    console.error("Error al obtener los restaurantes:", error);
    throw error;
  }

  return data || [];
};

/**
 * Crea un nuevo restaurante invocando una Edge Function de Supabase.
 */
export const createRestaurant = async (
  restaurantData: NewRestaurantData,
  logoFile: File | null
): Promise<void> => {
  const formDataPayload = new FormData();
  formDataPayload.append('name', restaurantData.name);
  formDataPayload.append('description', restaurantData.description);
  formDataPayload.append('city', restaurantData.city);
  formDataPayload.append('commune', restaurantData.commune);
  formDataPayload.append('street', restaurantData.street);
  formDataPayload.append('streetNumber', restaurantData.streetNumber);

  if (logoFile) {
    formDataPayload.append('logoFile', logoFile);
  }

  const { error } = await supabase.functions.invoke('create-restaurant', {
    body: formDataPayload,
  });

  if (error) {
    console.error("Error invoking Edge Function 'create-restaurant':", error);
    throw new Error(error.message || 'Ocurrió un error en el servidor al crear el restaurante.');
  }
};

/**
 * Actualiza los datos de un restaurante específico en la base de datos.
 */
export const updateRestaurant = async (
  restaurantId: string,
  dataToUpdate: UpdateRestaurantData
): Promise<Restaurant | null> => {
  if (!restaurantId) {
    throw new Error("Se requiere un ID de restaurante para actualizar.");
  }

  const { data, error } = await supabase
    .from('restaurant')
    .update(dataToUpdate)
    .eq('id', restaurantId)
    .select() // Devuelve la fila actualizada
    .single();

  if (error) {
    console.error("Error al actualizar el restaurante:", error);
    throw error;
  }

  return data;
};

// --- ✨ NUEVA FUNCIÓN AÑADIDA ---
/**
 * Elimina un restaurante específico por su ID.
 * Nota: Es una buena práctica configurar un trigger en la base de datos de Supabase
 * para que al eliminar una fila de 'restaurant', también se elimine su logo del Storage.
 */
export const deleteRestaurant = async (restaurantId: string): Promise<void> => {
  if (!restaurantId) {
    throw new Error("Se requiere un ID de restaurante para eliminar.");
  }

  const { error } = await supabase
    .from('restaurant')
    .delete()
    .eq('id', restaurantId);

  if (error) {
    console.error(`Error al eliminar el restaurante ${restaurantId}:`, error);
    throw new Error('No se pudo eliminar el restaurante.');
  }
};
