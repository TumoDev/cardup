
import { supabase } from '../utils/supabase';

// Tipos de datos basados en tu esquema
export interface Manager {
  id: string; // uuid
  name: string | null;
  email: string | null;
  phone_number: string | null;
  username: string | null;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

// Datos que el usuario puede actualizar
export type UpdateManagerData = Partial<Pick<Manager, 'name' | 'username' | 'phone_number'>>;

/**
 * Obtiene el perfil del manager actualmente autenticado.
 */
export async function getManagerProfile(): Promise<Manager> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado.');

  const { data, error } = await supabase
    .from('manager')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching manager profile:', error);
    throw new Error('No se pudo cargar el perfil del manager.');
  }
  if (!data) throw new Error('Perfil de manager no encontrado.');

  return data;
}

/**
 * Actualiza el perfil del manager actualmente autenticado.
 * @param updateData - Los datos a actualizar.
 */
export async function updateManagerProfile(updateData: UpdateManagerData): Promise<Manager> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado.');

  // Prepara los datos, asegurándose de no enviar claves con valor `undefined`
  const dataToUpdate: UpdateManagerData = {};
  if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
  if (updateData.username !== undefined) dataToUpdate.username = updateData.username;
  if (updateData.phone_number !== undefined) dataToUpdate.phone_number = updateData.phone_number;


  const { data, error } = await supabase
    .from('manager')
    .update(dataToUpdate)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating manager profile:', error);
    throw new Error('No se pudo actualizar el perfil.');
  }

  return data;
}
