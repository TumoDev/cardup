import { supabase } from '../utils/supabase';
import type { AuthModel } from '../models/AuthModel';
import type { RegistrationFormModel } from '../models/RegistrationFormModel';

/**
 * Inicia la sesión de un usuario con email y contraseña.
 */
export const login = async (credentials: AuthModel) => {
  const { email, password } = credentials;
  if (!email || !password) {
    return { data: null, error: { message: 'Email y contraseña son requeridos.' } };
  }
  return await supabase.auth.signInWithPassword({ email, password });
};

/**
 * Registra un nuevo usuario en Supabase Auth.
 * La creación del perfil de 'manager' se delega a un trigger en la base de datos.
 * La creación del restaurante y la dirección NO se hace aquí; debe ocurrir
 * después de que el usuario verifique su correo y inicie sesión por primera vez.
 *
 * @param formData - Datos del formulario de registro.
 * @returns La respuesta de la operación signUp de Supabase.
 */
export const register = async (formData: RegistrationFormModel) => {
  // La función ahora solo se encarga de llamar a signUp.
  // El trigger de la base de datos se encargará de crear el perfil del manager.
  const { data, error } = await supabase.auth.signUp({
    email: formData.user.email,
    password: formData.user.password,
    options: {
      // Estos metadatos serán utilizados por el trigger de la base de datos
      // para poblar la tabla 'manager'. Es crucial que 'full_name' se envíe.
      data: {
        username: formData.user.username,
        full_name: formData.manager.name,
        phone_number: formData.manager.phoneNumber,

      },
    },
  });

  if (error) {
    throw error;
  }

  // ¡No hacemos nada más! Las inserciones manuales han sido eliminadas.
  // El proceso de registro termina aquí. El usuario ahora debe verificar su correo.
  return data;
};

/**
 * Cierra la sesión del usuario actual.
 */
export const logout = async () => {
  await supabase.auth.signOut();
};

/**
 * Obtiene la información del usuario de la sesión actual.
 * @returns El objeto de usuario si hay una sesión activa, o null.
 */
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
};
