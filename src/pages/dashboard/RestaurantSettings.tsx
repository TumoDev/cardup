import React, { useState, useEffect, useRef } from 'react';
import {
  IonCardContent, IonItem, IonLabel, IonInput, IonButton,
  IonSpinner, IonTextarea, IonToast, IonAvatar, IonIcon, IonBadge,
  IonAlert, IonModal
} from '@ionic/react';
import { camera, warning, checkmarkCircle, pauseCircle, keyOutline } from 'ionicons/icons';
import * as restaurantService from '../../services/restaurantService';
import type { RestaurantEditFormData, Restaurant } from '../../services/restaurantService';

interface RestaurantSettingsProps {
  restaurantId: string | null;
  onUpdate: () => void; // Acepta una función de callback para notificar al padre
}

const FormField: React.FC<{
  label: string; name: string; value: string | number | null | undefined; onIonChange: (e: any) => void;
  type?: 'text' | 'number' | 'email'; placeholder?: string;
}> = ({ label, name, value, onIonChange, type = 'text', placeholder = '' }) => (
  <IonItem className="bg-transparent rounded-xl mb-4" lines="none">
    <IonLabel position="stacked" className="!mb-2 text-gray-700 font-medium">{label}</IonLabel>
    <IonInput name={name} type={type} value={value ?? ''} onIonChange={onIonChange} placeholder={placeholder} className="bg-white rounded-lg px-4 border border-gray-300 focus:border-blue-500 custom-input" />
  </IonItem>
);

const RestaurantSettings: React.FC<RestaurantSettingsProps> = ({ restaurantId, onUpdate }) => {
  const [formData, setFormData] = useState<RestaurantEditFormData>({});
  const [restaurantData, setRestaurantData] = useState<Restaurant | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  
  // Estados para el modal de autenticación
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [pendingAction, setPendingAction] = useState<'suspend' | 'activate' | null>(null);
  
  const [toast, setToast] = useState({ isOpen: false, message: '', color: 'success' });

  useEffect(() => {
    const fetchRestaurantData = async () => {
      setIsLoading(true);
      setLogoFile(null);
      setLogoPreview(null);
      if (!restaurantId) {
        setIsLoading(false);
        setFormData({});
        setRestaurantData(null);
        return;
      }
      try {
        const data = await restaurantService.getRestaurantById(restaurantId);
        if (data) {
          setRestaurantData(data);
          setFormData({
            name: data.name, description: data.description ?? '', city: data.city,
            commune: data.commune, street: data.street, street_number: data.street_number,
          });
          setLogoPreview(data.logo);
        }
      } catch (error: any) {
        setToast({ isOpen: true, message: `Error al cargar datos: ${error.message}`, color: 'danger' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurantData();
  }, [restaurantId]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    if (!restaurantId) return;
    setIsSubmitting(true);
    try {
      await restaurantService.updateRestaurantWithLogo(restaurantId, formData, logoFile);
      // Aquí se muestra la alerta de éxito, como querías.
      setToast({ isOpen: true, message: '¡Restaurante actualizado con éxito!', color: 'success' });
      setLogoFile(null);
      // Notifica al componente padre que la actualización fue exitosa
      onUpdate();
    } catch (error: any) {
      setToast({ isOpen: true, message: `Error al guardar: ${error.message}`, color: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChangeRequest = (action: 'suspend' | 'activate') => {
    setPendingAction(action);
    setShowAuthModal(true);
    setAuthEmail('');
    setAuthPassword('');
  };

  const handleAuthenticatedStatusChange = async () => {
    if (!restaurantId || !restaurantData || !pendingAction) return;
    if (!authEmail.trim() || !authPassword.trim()) {
      setToast({ isOpen: true, message: 'Por favor ingresa email y contraseña', color: 'warning' });
      return;
    }
    
    setIsUpdatingStatus(true);
    try {
      let updatedRestaurant: Restaurant;
      
      if (pendingAction === 'suspend') {
        updatedRestaurant = await restaurantService.suspendRestaurantWithAuth(
          restaurantId, 
          authEmail, 
          authPassword
        );
      } else {
        updatedRestaurant = await restaurantService.activateRestaurantWithAuth(
          restaurantId, 
          authEmail, 
          authPassword
        );
      }
      
      // Actualizar el estado local con los datos devueltos por la función
      setRestaurantData(updatedRestaurant);
      
      const statusMessage = pendingAction === 'suspend' 
        ? 'Restaurante suspendido exitosamente' 
        : 'Restaurante habilitado exitosamente';
        
      setToast({ isOpen: true, message: statusMessage, color: 'success' });
      onUpdate(); // Notificar al padre
      
      // Cerrar modal
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
      setPendingAction(null);
      
    } catch (error: any) {
      setToast({ isOpen: true, message: `Error: ${error.message}`, color: 'danger' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = () => {
    if (!restaurantData || restaurantData.status === 'available') return null;
    
    return (
      <IonBadge 
        color="warning" 
        className="ml-2"
      >
        <IonIcon 
          icon={pauseCircle} 
          className="mr-1" 
          size="small"
        />
        Suspendido
      </IonBadge>
    );
  };

  const getStatusButton = () => {
    if (!restaurantData) return null;
    
    const isAvailable = restaurantData.status === 'available';
    
    return (
      <IonButton
        fill="outline"
        size="small"
        color={isAvailable ? 'warning' : 'success'}
        onClick={() => handleStatusChangeRequest(isAvailable ? 'suspend' : 'activate')}
        disabled={isUpdatingStatus}
      >
        {isUpdatingStatus ? (
          <IonSpinner name="dots" />
        ) : (
          <>
            <IonIcon 
              slot="start" 
              icon={isAvailable ? pauseCircle : checkmarkCircle} 
            />
            {isAvailable ? 'Suspender' : 'Habilitar'}
          </>
        )}
      </IonButton>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><IonSpinner name="crescent" /></div>;
  }

  return (
    <IonCardContent>
      <style>{`.custom-input .native-input { padding: 1rem 0.5rem !important; }`}</style>
      
      {/* Estado del Restaurante */}
      {restaurantData && (
        <IonItem lines="none" className="mb-6 bg-gray-50 rounded-xl">
          <IonLabel>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-800">Estado del Restaurante</h3>
                {getStatusBadge()}
              </div>
              {getStatusButton()}
            </div>
          </IonLabel>
        </IonItem>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
        <IonItem lines="none" className="mb-6">
          <IonLabel position="stacked" className="!mb-3 text-gray-700 font-medium">Logo del Restaurante</IonLabel>
          <div className="flex items-center gap-4 w-full pt-2">
            <IonAvatar className="w-20 h-20 border-2 border-gray-200 bg-gray-100">
              {logoPreview && <img src={logoPreview} alt="Vista previa del logo" className="object-cover w-full h-full" />}
            </IonAvatar>
            <div>
              <IonButton type="button" fill="outline" onClick={() => fileInputRef.current?.click()}>
                <IonIcon slot="start" icon={camera} />
                Cambiar Logo
              </IonButton>
              <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
            </div>
          </div>
        </IonItem>
        <FormField label="Nombre del Restaurante" name="name" value={formData.name} onIonChange={handleInputChange} />
        <IonItem className="bg-transparent rounded-xl mb-4" lines="none">
          <IonLabel position="stacked" className="!mb-2 text-gray-700 font-medium">Descripción</IonLabel>
          <IonTextarea name="description" value={formData.description ?? ''} onIonChange={handleInputChange} autoGrow={true} className="bg-white rounded-lg px-4 py-2 border border-gray-300 min-h-[100px]" />
        </IonItem>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <FormField label="Ciudad" name="city" value={formData.city} onIonChange={handleInputChange} />
          <FormField label="Comuna" name="commune" value={formData.commune} onIonChange={handleInputChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
          <div className="md:col-span-2">
            <FormField label="Calle" name="street" value={formData.street} onIonChange={handleInputChange} />
          </div>
          <FormField label="Número" name="street_number" type="number" value={formData.street_number} onIonChange={handleInputChange} />
        </div>
        <IonButton type="submit" expand="block" className="mt-6 h-14 font-medium rounded-lg" disabled={isSubmitting}>
          {isSubmitting ? <IonSpinner name="dots" /> : 'Guardar Cambios'}
        </IonButton>
      </form>

      {/* Modal de autenticación */}
      <IonModal isOpen={showAuthModal} onDidDismiss={() => setShowAuthModal(false)}>
        <IonCardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Verificación de Credenciales
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Para {pendingAction === 'suspend' ? 'suspender' : 'habilitar'} el restaurante, 
            ingresa tus credenciales de manager.
          </p>

          <IonItem className="mb-4">
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput
              type="email"
              value={authEmail}
              onIonChange={(e) => setAuthEmail(e.detail.value!)}
              placeholder="tu@email.com"
            />
          </IonItem>

          <IonItem className="mb-6">
            <IonLabel position="stacked">Contraseña</IonLabel>
            <IonInput
              type="password"
              value={authPassword}
              onIonChange={(e) => setAuthPassword(e.detail.value!)}
              placeholder="••••••••"
            />
          </IonItem>

          <div className="flex gap-3">
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => setShowAuthModal(false)}
              disabled={isUpdatingStatus}
            >
              Cancelar
            </IonButton>
            <IonButton
              expand="block"
              onClick={handleAuthenticatedStatusChange}
              disabled={isUpdatingStatus}
              color={pendingAction === 'suspend' ? 'warning' : 'success'}
            >
              {isUpdatingStatus ? (
                <IonSpinner name="dots" />
              ) : (
                <>
                  <IonIcon slot="start" icon={keyOutline} />
                  {pendingAction === 'suspend' ? 'Suspender' : 'Habilitar'}
                </>
              )}
            </IonButton>
          </div>
        </IonCardContent>
      </IonModal>

      <IonToast isOpen={toast.isOpen} message={toast.message} duration={3000} onDidDismiss={() => setToast({ ...toast, isOpen: false })} color={toast.color as any} position="top" />
    </IonCardContent>
  );
};

export default RestaurantSettings;
