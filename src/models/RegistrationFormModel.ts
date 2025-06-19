export type RegistrationFormModel = {
  user: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string; // Solo para validación en el frontend
  };
  manager: {
    name: string; // Este será el 'full_name' en los metadatos de Supabase
    phoneNumber: string;
  };
};
