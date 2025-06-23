import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonButton, IonSpinner, IonIcon, IonCard, IonCardContent,
  IonInput, IonToast, IonButtons, IonText, IonAvatar,
  IonAlert, IonModal, IonSkeletonText, IonBadge
} from '@ionic/react';
import {
  businessOutline, addCircleOutline, logOutOutline, chevronForwardOutline, trashOutline,
  personCircleOutline, close, personOutline, atOutline, callOutline,
  checkmarkCircle, pauseCircle, keyOutline
} from 'ionicons/icons';
import { logout } from '../services/authService';
import * as restaurantService from '../services/restaurantService';
import type { Restaurant, NewRestaurantData } from '../services/restaurantService';
import * as managerService from '../services/managerService';
import type { UpdateManagerData } from '../services/managerService';
import { supabase } from '../utils/supabase';


const RestaurantSelectionPage: React.FC = () => {
  const history = useHistory();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', color: 'danger' });

  const [showDeleteAlert, setShowDeleteAlert] = useState<{
    isOpen: boolean; restaurantId: string | null; restaurantName: string | null;
  }>({ isOpen: false, restaurantId: null, restaurantName: null });

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [managerProfile, setManagerProfile] = useState<UpdateManagerData>({});
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  // Estados para el modal de habilitación
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [enableRestaurantData, setEnableRestaurantData] = useState<Restaurant | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [formData, setFormData] = useState<NewRestaurantData>({
    name: '', description: '', city: '', commune: '', street: '', streetNumber: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    try {
      const userRestaurants = await restaurantService.getUserRestaurants();
      setRestaurants(Array.isArray(userRestaurants) ? userRestaurants : []);
    } catch (error: any) {
      if (error.message.includes("Usuario no autenticado")) {
        history.replace('/login');
      } else {
        setToast({ isOpen: true, message: `Error al cargar restaurantes: ${error.message}`, color: 'danger' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [history]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleSelectRestaurant = (restaurantId: string, restaurant: Restaurant) => {
    // Verificar si el restaurante está disponible
    if (restaurant.status === 'notavailable') {
      // Mostrar modal de habilitación en lugar de toast
      setEnableRestaurantData(restaurant);
      setShowEnableModal(true);
      return;
    }
    
    localStorage.setItem('restaurantId', restaurantId);
    history.push(`/dashboard`);
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.city.trim() || !formData.street.trim()) {
      setToast({ isOpen: true, message: 'Nombre, ciudad y calle son obligatorios.', color: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      await restaurantService.createRestaurant(formData, logoFile);
      setToast({ isOpen: true, message: '🎉 ¡Restaurante creado con éxito!', color: 'success' });
      setShowCreateForm(false);
      setFormData({ name: '', description: '', city: '', commune: '', street: '', streetNumber: '' });
      setLogoFile(null);
      setLogoPreview(null);
      fetchRestaurants();
    } catch (error: any) {
      setToast({ isOpen: true, message: `❌ Error al crear el restaurante: ${error.message}`, color: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteAlert.restaurantId) return;
    setIsSubmitting(true);
    try {
      await restaurantService.deleteRestaurant(showDeleteAlert.restaurantId);
      setToast({ isOpen: true, message: 'Restaurante eliminado correctamente.', color: 'success' });
      setRestaurants(prev => prev.filter(r => r.id !== showDeleteAlert.restaurantId));
    } catch (error: any) {
      setToast({ isOpen: true, message: `Error al eliminar: ${error.message}`, color: 'danger' });
    } finally {
      setIsSubmitting(false);
      setShowDeleteAlert({ isOpen: false, restaurantId: null, restaurantName: null });
    }
  };

  const handleOpenEditProfile = async () => {
    setIsProfileLoading(true);
    setShowEditProfileModal(true);
    try {
      const profile = await managerService.getManagerProfile();
      setManagerProfile({
        name: profile.name || '',
        username: profile.username || '',
        phone_number: profile.phone_number || '',
      });
    } catch (error: any) {
      setToast({ isOpen: true, message: `Error al cargar perfil: ${error.message}`, color: 'danger' });
      setShowEditProfileModal(false);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSubmitting(true);
    try {
      await managerService.updateManagerProfile(managerProfile);
      setToast({ isOpen: true, message: 'Perfil actualizado con éxito.', color: 'success' });
      setShowEditProfileModal(false);
    } catch (error: any) {
      setToast({ isOpen: true, message: `Error al actualizar: ${error.message}`, color: 'danger' });
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    history.replace('/login');
  };

  const handleEnableRestaurant = async () => {
    if (!email.trim() || !password.trim()) {
      setToast({ isOpen: true, message: 'Por favor ingresa email y contraseña', color: 'warning' });
      return;
    }

    if (!enableRestaurantData) return;

    setIsAuthenticating(true);
    try {
      // Habilitar el restaurante usando la nueva función con autenticación
      const updatedRestaurant = await restaurantService.activateRestaurantWithAuth(
        enableRestaurantData.id,
        email,
        password
      );
      
      // Actualizar la lista de restaurantes
      setRestaurants(prev => prev.map(r => 
        r.id === enableRestaurantData.id ? updatedRestaurant : r
      ));
      
      setToast({ isOpen: true, message: 'Restaurante habilitado exitosamente', color: 'success' });
      
      // Cerrar modal y limpiar datos
      setShowEnableModal(false);
      setEmail('');
      setPassword('');
      setEnableRestaurantData(null);

    } catch (error: any) {
      setToast({ isOpen: true, message: `Error: ${error.message}`, color: 'danger' });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const FormField: React.FC<{
    label: string; value: string | null; onIonChange: (e: any) => void;
    required?: boolean; type?: string; placeholder?: string;
  }> = ({ label, value, onIonChange, required = false, type = 'text', placeholder = '' }) => (
    <IonItem className="bg-transparent rounded-xl mb-4" lines="none">
      <IonLabel position="stacked" className="!mb-2 text-gray-700 font-medium">{label}{required && ' *'}</IonLabel>
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
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#F8F9FA', '--padding-start': '1rem', '--padding-end': '1rem' }}>
          <IonTitle className="font-semibold text-gray-800">Bienvenido</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleOpenEditProfile} fill="clear" className="text-gray-600">
              <IonIcon slot="icon-only" icon={personCircleOutline} />
            </IonButton>
            <IonButton onClick={handleLogout} fill="clear" className="text-gray-600 capitalize">
              Salir
              <IonIcon slot="end" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding bg-gray-50">
        <style>{`.custom-input .native-input { padding: 1rem 0.5rem !important; }`}</style>
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-full">
              <IonSpinner name="crescent" className="w-12 h-12 text-blue-600" />
              <IonText className="mt-4 text-gray-500">Cargando tus datos...</IonText>
            </div>
          ) : (
            <>
              <IonCard className="shadow-lg rounded-2xl overflow-hidden">
                <IonCardContent className="p-4 md:p-6">
                  <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-800">Mis Restaurantes</h1>
                    <p className="text-sm text-gray-500 mt-1">Selecciona uno para continuar o crea uno nuevo.</p>
                  </div>

                  {restaurants.length > 0 ? (
                    <IonList lines="none" className="space-y-3">
                      {restaurants.filter(r => r).map((r) => (
                        <IonItem key={r.id} button detail={false} onClick={() => handleSelectRestaurant(r.id, r)} className="rounded-xl transition-all hover:shadow-md hover:-translate-y-px hover:bg-gray-50">
                          <IonAvatar slot="start" className="w-12 h-12 border-2 border-gray-100 mr-4 bg-gray-200 flex items-center justify-center">
                            {r.logo ? (
                              <img src={r.logo} alt={`Logo de ${r.name}`} className="object-cover w-full h-full" />
                            ) : (
                              <IonIcon icon={businessOutline} className="text-2xl text-gray-500" />
                            )}
                          </IonAvatar>
                          <IonLabel className="py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <h2 className="font-bold text-lg text-gray-800">{r.name}</h2>
                              {r.status === 'notavailable' && (
                                <IonBadge 
                                  color="warning" 
                                  className="text-xs"
                                >
                                  <IonIcon 
                                    icon={pauseCircle} 
                                    className="mr-1" 
                                    size="small"
                                  />
                                  Suspendido
                                </IonBadge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm whitespace-normal">{r.description || 'Sin descripción'}</p>
                          </IonLabel>
                          <IonButton fill="clear" color="danger" slot="end" disabled={isSubmitting} onClick={(e) => { e.stopPropagation(); setShowDeleteAlert({ isOpen: true, restaurantId: r.id, restaurantName: r.name }); }}>
                            <IonIcon icon={trashOutline} />
                          </IonButton>
                          <IonIcon icon={chevronForwardOutline} slot="end" color="medium" />
                        </IonItem>
                      ))}
                    </IonList>
                  ) : (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IonIcon icon={businessOutline} className="text-3xl text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-700">Aún no tienes restaurantes</h3>
                      <IonText><p className="text-sm mt-2 text-gray-500">¡No te preocupes! Crear tu primer restaurante es muy fácil. Haz clic en el botón de abajo para empezar.</p></IonText>
                    </div>
                  )}
                  <IonButton expand="block" fill={showCreateForm ? "outline" : "solid"} onClick={() => setShowCreateForm(!showCreateForm)} className="mt-6 h-14 font-medium rounded-lg">
                    <IonIcon slot="start" icon={addCircleOutline} />
                    {showCreateForm ? 'Cancelar Creación' : 'Crear Nuevo Restaurante'}
                  </IonButton>
                </IonCardContent>
              </IonCard>

              {showCreateForm && (
                <IonCard className="mt-6 animate-fade-in-up shadow-lg rounded-2xl overflow-hidden">
                  <IonCardContent className="p-4 md:p-6">
                    <h1 className="text-xl font-bold text-gray-800 mb-4">Registrar un nuevo espacio</h1>
                    <form onSubmit={handleCreateRestaurant} noValidate>
                      <FormField label="Nombre del Restaurante" value={formData.name} onIonChange={e => setFormData({ ...formData, name: e.detail.value! })} required placeholder="Ej: La Buena Mesa" />
                      <FormField label="Descripción Breve" value={formData.description} onIonChange={e => setFormData({ ...formData, description: e.detail.value! })} placeholder="Comida tradicional chilena" />
                      <IonItem className="bg-transparent rounded-xl mb-4" lines="none">
                        <IonLabel position="stacked" className="!mb-2 text-gray-700 font-medium">Logo del Restaurante</IonLabel>
                        <div className="flex items-center w-full gap-4 pt-2">
                          <IonButton fill="outline" onClick={() => fileInputRef.current?.click()} className="rounded-lg">Seleccionar Archivo</IonButton>
                          <input ref={fileInputRef} type="file" hidden accept="image/png, image/jpeg, image/webp" onChange={(e) => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); } }} />
                          {logoPreview ? (<img src={logoPreview} alt="Vista previa" className="w-16 h-16 rounded-lg object-cover border" />) : (<div className="w-16 h-16 rounded-lg border bg-gray-100 flex items-center justify-center"><IonIcon icon={businessOutline} className="text-gray-400 text-2xl" /></div>)}
                        </div>
                      </IonItem>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        <FormField label="Ciudad" value={formData.city} onIonChange={e => setFormData({ ...formData, city: e.detail.value! })} required placeholder="Santiago" />
                        <FormField label="Comuna" value={formData.commune} onIonChange={e => setFormData({ ...formData, commune: e.detail.value! })} placeholder="Providencia" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                        <div className="md:col-span-2"><FormField label="Calle" value={formData.street} onIonChange={e => setFormData({ ...formData, street: e.detail.value! })} required placeholder="Av. Principal" /></div>
                        <FormField label="Número" value={formData.streetNumber} onIonChange={e => setFormData({ ...formData, streetNumber: e.detail.value! })} type="number" placeholder="123" />
                      </div>
                      <IonButton type="submit" expand="block" className="mt-4 h-14 font-medium rounded-lg" disabled={isSubmitting}>
                        {isSubmitting ? <IonSpinner name="crescent" /> : 'Guardar Restaurante'}
                      </IonButton>
                    </form>
                  </IonCardContent>
                </IonCard>
              )}
            </>
          )}
        </div>

        <IonToast isOpen={toast.isOpen} message={toast.message} duration={3000} onDidDismiss={() => setToast({ ...toast, isOpen: false })} color={toast.color as any} position="top" />

        <IonAlert isOpen={showDeleteAlert.isOpen} onDidDismiss={() => setShowDeleteAlert({ isOpen: false, restaurantId: null, restaurantName: null })} header={'Confirmar Eliminación'} message={`¿Estás seguro de que quieres eliminar <strong>${showDeleteAlert.restaurantName}</strong>? Esta acción no se puede deshacer.`} buttons={[{ text: 'Cancelar', role: 'cancel' }, { text: 'Eliminar', role: 'destructive', cssClass: 'ion-color-danger', handler: handleConfirmDelete }]} />

        <IonModal
          isOpen={showEditProfileModal}
          onDidDismiss={() => setShowEditProfileModal(false)}
        >
          <IonHeader className="ion-no-border">
            <IonToolbar>
              <IonTitle className="text-center font-semibold">Editar Mi Perfil</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowEditProfileModal(false)}>
                  <IonIcon slot="icon-only" icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {isProfileLoading ? (
              <div className="space-y-6 mt-4">
                <div className="flex justify-center">
                  <IonSkeletonText animated style={{ width: '96px', height: '96px', borderRadius: '50%' }} />
                </div>
                <IonItem lines="none" className="bg-gray-100 rounded-xl">
                  <IonSkeletonText animated style={{ width: '80px', height: '16px', marginBottom: '8px' }} />
                  <IonSkeletonText animated style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
                </IonItem>
                <IonItem lines="none" className="bg-gray-100 rounded-xl">
                  <IonSkeletonText animated style={{ width: '120px', height: '16px', marginBottom: '8px' }} />
                  <IonSkeletonText animated style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
                </IonItem>
                <IonSkeletonText animated style={{ width: '100%', height: '56px', borderRadius: '12px', marginTop: '16px' }} />
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-grow">
                  <div className="text-center mb-6">
                    <IonAvatar className="w-24 h-24 mx-auto bg-blue-100 text-blue-600 mb-2 flex items-center justify-center">
                      <IonIcon icon={personCircleOutline} className="text-6xl" />
                    </IonAvatar>
                  </div>
                  <form onSubmit={handleUpdateProfile} noValidate>
                    <IonItem lines="none" className="bg-gray-100 rounded-xl mb-4">
                      <IonIcon icon={personOutline} slot="start" className="text-gray-500 ml-2" />
                      <IonLabel position="stacked" className="!ml-2 text-gray-600">Nombre Completo</IonLabel>
                      <IonInput value={managerProfile.name || ''} onIonChange={e => setManagerProfile({ ...managerProfile, name: e.detail.value! })} placeholder="Tu nombre y apellido" className="custom-input" />
                    </IonItem>
                    <IonItem lines="none" className="bg-gray-100 rounded-xl mb-4">
                      <IonIcon icon={atOutline} slot="start" className="text-gray-500 ml-2" />
                      <IonLabel position="stacked" className="!ml-2 text-gray-600">Nombre de Usuario</IonLabel>
                      <IonInput value={managerProfile.username || ''} onIonChange={e => setManagerProfile({ ...managerProfile, username: e.detail.value! })} placeholder="Tu alias público" className="custom-input" />
                    </IonItem>
                    <IonItem lines="none" className="bg-gray-100 rounded-xl mb-4">
                      <IonIcon icon={callOutline} slot="start" className="text-gray-500 ml-2" />
                      <IonLabel position="stacked" className="!ml-2 text-gray-600">Teléfono</IonLabel>
                      <IonInput type="tel" value={managerProfile.phone_number || ''} onIonChange={e => setManagerProfile({ ...managerProfile, phone_number: e.detail.value! })} placeholder="+56 9 1234 5678" className="custom-input" />
                    </IonItem>
                    <IonButton type="submit" expand="block" className="mt-8 h-14 font-bold rounded-xl" disabled={isProfileSubmitting}>
                      {isProfileSubmitting ? <IonSpinner name="crescent" /> : 'Guardar Cambios'}
                    </IonButton>
                  </form>
                </div>
              </div>
            )}
          </IonContent>
        </IonModal>

        <IonModal
          isOpen={showEnableModal}
          onDidDismiss={() => setShowEnableModal(false)}
        >
          <IonCardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Verificación de Credenciales
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Para habilitar <strong>{enableRestaurantData?.name}</strong>, 
              ingresa tus credenciales de manager propietario.
            </p>

            <IonItem className="mb-4">
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
                placeholder="tu@email.com"
              />
            </IonItem>

            <IonItem className="mb-6">
              <IonLabel position="stacked">Contraseña</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
                placeholder="••••••••"
              />
            </IonItem>

            <div className="flex gap-3">
              <IonButton
                expand="block"
                fill="outline"
                onClick={() => setShowEnableModal(false)}
                disabled={isAuthenticating}
              >
                Cancelar
              </IonButton>
              <IonButton
                expand="block"
                onClick={handleEnableRestaurant}
                disabled={isAuthenticating}
                color="success"
              >
                {isAuthenticating ? (
                  <IonSpinner name="dots" />
                ) : (
                  <>
                    <IonIcon slot="start" icon={keyOutline} />
                    Habilitar
                  </>
                )}
              </IonButton>
            </div>
          </IonCardContent>
        </IonModal>


      </IonContent>
    </IonPage>
  );
};

export default RestaurantSelectionPage;
