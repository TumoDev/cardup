import { supabase } from '../utils/supabase';


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
  status: string;
};

export type NewRestaurantData = {
  name: string;
  description: string;
  city: string;
  commune: string;
  street: string;
  streetNumber: string;
};

export type RestaurantEditFormData = {
  name?: string;
  description?: string;
  city?: string;
  commune?: string;
  street?: string;
  street_number?: number | null;
};



export const getRestaurantById = async (restaurantId: string): Promise<Restaurant | null> => {
  if (!restaurantId) return null;
  const { data, error } = await supabase.from('restaurant').select('*').eq('id', restaurantId).single();
  if (error && error.code !== 'PGRST116') {
    console.error(`Error al obtener el restaurante ${restaurantId}:`, error);
    throw error;
  }
  return data;
};

export const getUserRestaurants = async (): Promise<Restaurant[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");
  const { data, error } = await supabase.from('restaurant').select('*').eq('manager_id', user.id);
  if (error) throw error;
  return data || [];
};

export const createRestaurant = async (restaurantData: NewRestaurantData, logoFile: File | null): Promise<void> => {
  const formDataPayload = new FormData();
  formDataPayload.append('name', restaurantData.name);
  formDataPayload.append('description', restaurantData.description);
  formDataPayload.append('city', restaurantData.city);
  formDataPayload.append('commune', restaurantData.commune);
  formDataPayload.append('street', restaurantData.street);
  formDataPayload.append('streetNumber', restaurantData.streetNumber);
  if (logoFile) formDataPayload.append('logoFile', logoFile);
  const { error } = await supabase.functions.invoke('create-restaurant', { body: formDataPayload });
  if (error) throw new Error(error.message || 'Ocurrió un error en el servidor al crear el restaurante.');
};

export const deleteRestaurant = async (restaurantId: string): Promise<void> => {
  if (!restaurantId) throw new Error("Se requiere un ID de restaurante para eliminar.");
  const { error } = await supabase.from('restaurant').delete().eq('id', restaurantId);
  if (error) throw new Error('No se pudo eliminar el restaurante.');
};

export const updateRestaurantWithLogo = async (
  restaurantId: string,
  formData: RestaurantEditFormData,
  logoFile: File | null
): Promise<Restaurant> => {
  let logoUrl: string | null = null;

  // 1. Subir el nuevo logo si el usuario seleccionó uno
  if (logoFile) {
    const fileExtension = logoFile.name.split('.').pop();
    const filePath = `public/${restaurantId}-${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from('logos') // Nombre de tu bucket
      .upload(filePath, logoFile);

    if (uploadError) {
      console.error('Error al subir el logo:', uploadError);
      throw new Error('No se pudo subir el nuevo logo.');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);

    logoUrl = publicUrl;
  }

  // 2. Preparar y llamar a la función RPC de la base de datos
  const rpcParams = {
    restaurant_id: restaurantId,
    new_name: formData.name,
    new_description: formData.description,
    new_city: formData.city,
    new_commune: formData.commune,
    new_street: formData.street,
    new_street_number: formData.street_number ? Number(formData.street_number) : null,
    new_logo_url: logoUrl,
  };

  const { data: updatedRestaurant, error: rpcError } = await supabase.rpc(
    'edit_restaurant_details',
    rpcParams
  );

  if (rpcError) {
    console.error('Error en la llamada RPC:', rpcError);
    throw new Error(rpcError.message);
  }

  if (!updatedRestaurant || updatedRestaurant.length === 0) {
    throw new Error("La actualización no devolvió los datos esperados.");
  }

  return updatedRestaurant[0]; // RPC devuelve un array, tomamos el primer elemento.
};

export const updateRestaurantStatusWithAuth = async (
  restaurantId: string, 
  status: 'available' | 'notavailable',
  email: string,
  password: string
): Promise<Restaurant> => {
  if (!restaurantId) throw new Error("Se requiere un ID de restaurante para actualizar el estado.");
  if (!email.trim() || !password.trim()) throw new Error("Se requieren credenciales para cambiar el estado.");
  
  const { data, error } = await supabase.rpc('update_restaurant_status_with_auth', {
    restaurant_id: restaurantId,
    new_status: status,
    manager_email: email.trim(),
    manager_password: password.trim()
  });
    
  if (error) {
    console.error('Error al actualizar el estado del restaurante:', error);
    throw new Error(error.message || 'No se pudo actualizar el estado del restaurante.');
  }

  if (!data || data.length === 0) {
    throw new Error("La actualización no devolvió los datos esperados.");
  }

  return data[0];
};

export const suspendRestaurantWithAuth = async (
  restaurantId: string, 
  email: string, 
  password: string
): Promise<Restaurant> => {
  return await updateRestaurantStatusWithAuth(restaurantId, 'notavailable', email, password);
};

export const activateRestaurantWithAuth = async (
  restaurantId: string, 
  email: string, 
  password: string
): Promise<Restaurant> => {
  return await updateRestaurantStatusWithAuth(restaurantId, 'available', email, password);
};

export const updateRestaurantStatus = async (restaurantId: string, status: 'available' | 'notavailable'): Promise<Restaurant> => {
  if (!restaurantId) throw new Error("Se requiere un ID de restaurante para actualizar el estado.");
  
  const { data, error } = await supabase.rpc('update_restaurant_status', {
    restaurant_id: restaurantId,
    new_status: status
  });
    
  if (error) {
    console.error('Error al actualizar el estado del restaurante:', error);
    throw new Error(error.message || 'No se pudo actualizar el estado del restaurante.');
  }

  if (!data || data.length === 0) {
    throw new Error("La actualización no devolvió los datos esperados.");
  }

  return data[0];
};

export const suspendRestaurant = async (restaurantId: string): Promise<Restaurant> => {
  return await updateRestaurantStatus(restaurantId, 'notavailable');
};

export const activateRestaurant = async (restaurantId: string): Promise<Restaurant> => {
  return await updateRestaurantStatus(restaurantId, 'available');
};
