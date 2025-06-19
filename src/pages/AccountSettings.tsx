import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonList,
  IonToast,
  IonSpinner,
  IonAlert,
} from '@ionic/react';
import { supabase } from '../../utils/supabase';
import { User as AuthUser } from '@supabase/supabase-js';

interface ManagerProfile {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
}

const AccountSettings: React.FC = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Partial<ManagerProfile>>({
    name: '',
    email: '',
    phone_number: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastInfo, setToastInfo] = useState<{ show: boolean; message: string; color?: string }>({
    show: false,
    message: '',
  });
  const [errorAlert, setErrorAlert] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          throw new Error('Error al obtener el usuario: ' + authError.message);
        }
        if (!user) {
          throw new Error('No hay usuario autenticado.');
        }
        setAuthUser(user);

        const { data: managerData, error: profileError } = await supabase
          .from('manager')
          .select('name, email, phone_number')
          .eq('id', user.id)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            setProfile({ email: user.email || '', name: '', phone_number: '' });
          } else {
            throw new Error('Error al cargar el perfil: ' + profileError.message);
          }
        }

        if (managerData) {
          setProfile({
            id: user.id,
            name: managerData.name || '',
            email: managerData.email || user.email || '',
            phone_number: managerData.phone_number || '',
          });
        } else if (!profileError || profileError.code === 'PGRST116') {
          setProfile({
            id: user.id,
            name: '',
            email: user.email || '',
            phone_number: ''
          });
        }

      } catch (error: any) {
        setErrorAlert({ show: true, message: error.message || 'Ocurrió un error desconocido.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!authUser) {
      setToastInfo({ show: true, message: 'Usuario no autenticado.', color: 'danger' });
      return;
    }
    if (!profile.name?.trim()) {
      setToastInfo({ show: true, message: 'El nombre es requerido.', color: 'warning' });
      return;
    }

    setIsSaving(true);
    let profileUpdateError = null;
    let authUpdateError = null;

    try {
      const profileDataToUpdate: Omit<Partial<ManagerProfile>, 'id'> = {
        name: profile.name,
        email: profile.email,
        phone_number: profile.phone_number || null,
      };

      const { error: managerUpdateError } = await supabase
        .from('manager')
        .update(profileDataToUpdate)
        .eq('id', authUser.id);

      if (managerUpdateError) {
        profileUpdateError = managerUpdateError;
      }

      if (newPassword.trim() !== '') {
        const { error: passwordUpdateError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passwordUpdateError) {
          authUpdateError = passwordUpdateError;
        } else {
          setNewPassword('');
        }
      }

      if (profile.email && profile.email !== authUser.email) {
        const { error: emailAuthUpdateError } = await supabase.auth.updateUser({
          email: profile.email
        });
        if (emailAuthUpdateError) {
          authUpdateError = authUpdateError ? new Error(authUpdateError.message + "; " + emailAuthUpdateError.message) : emailAuthUpdateError;
        }
      }

      if (profileUpdateError || authUpdateError) {
        let errorMessage = "Errores al guardar: ";
        if (profileUpdateError) errorMessage += `Perfil (${profileUpdateError.message}) `;
        if (authUpdateError) errorMessage += `Autenticación (${authUpdateError.message})`;
        throw new Error(errorMessage);
      }

      setToastInfo({ show: true, message: 'Configuración guardada exitosamente.', color: 'success' });

    } catch (error: any) {
      setToastInfo({ show: true, message: error.message || 'Error al guardar.', color: 'danger' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Configuración de Cuenta</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding ion-text-center">
          <IonSpinner name="crescent" />
          <p>Cargando datos del usuario...</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Configuración de Cuenta</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonAlert
          isOpen={errorAlert.show}
          onDidDismiss={() => setErrorAlert({ show: false, message: '' })}
          header={'Error'}
          message={errorAlert.message}
          buttons={['OK']}
        />

        <IonList lines="inset">
          <IonItem>
            <IonLabel position="stacked">Correo electrónico</IonLabel>
            <IonInput
              type="email"
              name="email"
              value={profile.email}
              placeholder="ejemplo@correo.com"
              onIonChange={handleInputChange}
              disabled={isSaving}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Nombre</IonLabel>
            <IonInput
              name="name"
              value={profile.name}
              placeholder="Tu nombre completo"
              onIonChange={handleInputChange}
              disabled={isSaving}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Número telefónico</IonLabel>
            <IonInput
              type="tel"
              name="phone_number"
              value={profile.phone_number || ''}
              placeholder="555-123-4567"
              onIonChange={handleInputChange}
              disabled={isSaving}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Nueva Contraseña</IonLabel>
            <IonInput
              type="password"
              value={newPassword}
              placeholder="Deja vacío para no cambiar"
              onIonChange={(e) => setNewPassword(e.detail.value!)}
              disabled={isSaving}
            />
          </IonItem>
        </IonList>

        <IonButton
          expand="block"
          className="ion-margin-top"
          onClick={handleSaveChanges}
          disabled={isSaving || isLoading}
        >
          {isSaving ? <IonSpinner name="dots" /> : 'Guardar Cambios'}
        </IonButton>

        <IonToast
          isOpen={toastInfo.show}
          message={toastInfo.message}
          duration={3000}
          color={toastInfo.color || 'dark'}
          onDidDismiss={() => setToastInfo({ show: false, message: '' })}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default AccountSettings;
