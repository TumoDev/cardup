import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonPage,
  IonInput,
  IonItem,
  IonLabel,
  IonToast,
  IonSpinner,
  IonRouterLink,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import { register } from '../../services/authService';
import { RegistrationFormModel } from '../../models/RegistrationFormModel';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationFormModel>({
    user: { username: '', email: '', password: '', confirmPassword: '' },
    manager: { name: '', phoneNumber: '' }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', color: 'danger' });
  const history = useHistory();

  const validateForm = (): boolean => {
    const { user, manager } = formData;
    if (!user.username.trim() || !user.email.trim() || !user.password || !user.confirmPassword || !manager.name.trim()) {
      setToast({ isOpen: true, message: 'Completa todos los campos obligatorios (*)', color: 'warning' });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(user.email)) {
      setToast({ isOpen: true, message: 'Ingresa un email válido', color: 'warning' });
      return false;
    }
    if (user.password.length < 6) {
      setToast({ isOpen: true, message: 'La contraseña debe tener al menos 6 caracteres', color: 'warning' });
      return false;
    }
    if (user.password !== user.confirmPassword) {
      setToast({ isOpen: true, message: 'Las contraseñas no coinciden', color: 'danger' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      await register(formData);
      setToast({ isOpen: true, message: '🎉 ¡Registro exitoso! Revisa tu correo para confirmar la cuenta.', color: 'success' });
      setTimeout(() => history.push('/login'), 200);
    } catch (error: any) {
      setToast({ isOpen: true, message: `❌ Error en el registro: ${error.message}`, color: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const FormField: React.FC<{
    label: string;
    value: string;
    onIonChange: (e: any) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
  }> = ({ label, value, onIonChange, type = 'text', placeholder = '', required = false }) => (
    <IonItem className="bg-transparent rounded-xl mb-4" lines="none">
      <IonLabel position="stacked" className="!mb-2 text-gray-700 mb-2">
        {label}{required && ' *'}
      </IonLabel>
      <IonInput
        type={type as any}
        value={value}
        onIonChange={onIonChange}
        placeholder={placeholder}
        className="bg-white rounded-lg px-4 border border-gray-300 focus:border-blue-500 custom-input"
      />
    </IonItem>
  );

  return (
    <IonPage>
      <IonToolbar style={{ '--background': '#F8F9FA' }}>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/login" text="Volver" className="text-blue-600" />
        </IonButtons>
      </IonToolbar>

      <IonContent fullscreen className="ion-padding bg-gray-50">
        <style>{`
          .custom-input .native-input {
            padding: 1rem 0.5rem !important;
          }
        `}</style>

        <div className="max-w-2xl mx-auto">
          <IonCard className="shadow-lg rounded-2xl overflow-hidden">
            <IonCardContent className="p-6 md:p-8">
              <h1 className="text-2xl font-bold mt-4 text-gray-800 text-center">Datos del Perfil</h1>

              <form onSubmit={handleSubmit} noValidate>
                <FormField
                  label="Correo Electrónico"
                  value={formData.user.email}
                  onIonChange={e => setFormData(p => ({ ...p, user: { ...p.user, email: e.detail.value! } }))}
                  type="email"
                  placeholder="ejemplo@correo.com"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  <FormField
                    label="Contraseña"
                    value={formData.user.password}
                    onIonChange={e => setFormData(p => ({ ...p, user: { ...p.user, password: e.detail.value! } }))}
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  <FormField
                    label="Confirmar Contraseña"
                    value={formData.user.confirmPassword}
                    onIonChange={e => setFormData(p => ({ ...p, user: { ...p.user, confirmPassword: e.detail.value! } }))}
                    type="password"
                    placeholder="Repite la contraseña"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  <FormField
                    label="Nombre de Usuario"
                    value={formData.user.username}
                    onIonChange={e => setFormData(p => ({ ...p, user: { ...p.user, username: e.detail.value! } }))}
                    placeholder="tu_usuario"
                    required
                  />
                  <FormField
                    label="Nombre Completo (Manager)"
                    value={formData.manager.name}
                    onIonChange={e => setFormData(p => ({ ...p, manager: { ...p.manager, name: e.detail.value! } }))}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
                <FormField
                  label="Teléfono de Contacto"
                  value={formData.manager.phoneNumber}
                  onIonChange={e => setFormData(p => ({ ...p, manager: { ...p.manager, phoneNumber: e.detail.value! } }))}
                  type="tel"
                  placeholder="Ej: +56912345678"
                />

                <IonButton type="submit" expand="block" className="mt-8 h-14 font-medium" disabled={isLoading}>
                  {isLoading ? <IonSpinner name="crescent" /> : 'Crear Cuenta'}
                </IonButton>
              </form>

              <div className="mt-6 text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{' '}
                  <IonRouterLink routerLink="/login" className="text-blue-600 font-semibold hover:underline">
                    Inicia Sesión
                  </IonRouterLink>
                </p>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        <IonToast
          isOpen={toast.isOpen}
          message={toast.message}
          duration={4000}
          position="top"
          onDidDismiss={() => setToast({ ...toast, isOpen: false })}
          color={toast.color as any}
        />
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
