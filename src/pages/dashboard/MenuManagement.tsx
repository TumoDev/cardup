
import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import {
  IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonInput, IonTextarea,
  IonSelect, IonSelectOption, IonButton, IonList, IonItem,
  IonLabel, IonIcon, IonSpinner, IonAlert,
  IonAvatar, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonToast
} from '@ionic/react';
import {
  addOutline, createOutline, trashOutline,
  cubeOutline, checkmarkCircle, alertCircle
} from 'ionicons/icons';
import * as productService from '../../services/productService';
import type { Product, NewProductData, ProductFiles, UpdateProductData } from '../../services/productService';
import { supabase } from '../../utils/supabase';

const initialNewProductState: NewProductData = {
  name: '', description: '', price: 0, category: ''
};

const FormField: React.FC<{ label: string; name: string; value: any; onIonChange: (e: any) => void; type?: any; placeholder?: string; children?: React.ReactNode; component?: 'input' | 'textarea' | 'select' }> =
  ({ label, name, value, onIonChange, type = 'text', placeholder = '', children, component = 'input' }) => {
    const commonProps = {
      name, value, onIonChange, placeholder,
      className: "bg-white rounded-lg px-4 border border-gray-300 focus:border-blue-500 w-full"
    };
    return (
      <IonItem className="bg-transparent rounded-xl mb-4" lines="none">
        <IonLabel position="stacked" className="!mb-2 text-gray-700 font-medium">{label}</IonLabel>
        {component === 'input' && <IonInput {...commonProps} type={type} />}
        {component === 'textarea' && <IonTextarea {...commonProps} autoGrow={true} />}
        {component === 'select' && <IonSelect {...commonProps} interface="action-sheet">{children}</IonSelect>}
      </IonItem>
    );
  };

interface MenuManagementProps {
  restaurantId: string | null;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ restaurantId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<NewProductData>(initialNewProductState);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [toast, setToast] = useState({ isOpen: false, message: '', color: 'success', icon: checkmarkCircle });
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [usdzFile, setUsdzFile] = useState<File | null>(null);
  const [glbFile, setGlbFile] = useState<File | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const usdzInputRef = useRef<HTMLInputElement>(null);
  const glbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (restaurantId) {
        try {
          const fetchedProducts = await productService.getProductsByRestaurant(restaurantId);
          setProducts(fetchedProducts);
        } catch (err: any) {
          setProducts([]);
          showErrorToast(err.message);
        }
      } else {
        setProducts([]);
      }
      setLoading(false);
    };
    loadData();
  }, [restaurantId]);

  const handleInputChange = (e: any, stateSetter: React.Dispatch<React.SetStateAction<any>>) => {
    const { name, value } = e.target;
    const finalValue = name === 'price' ? parseFloat(value) || 0 : value;
    stateSetter((prev: any) => ({ ...prev, [name]: finalValue }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    setFile(e.target.files?.[0] || null);
  };

  const resetForm = () => {
    setNewProduct(initialNewProductState);
    setImageFile(null);
    setUsdzFile(null);
    setGlbFile(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (usdzInputRef.current) usdzInputRef.current.value = '';
    if (glbInputRef.current) glbInputRef.current.value = '';
  };

  const showSuccessToast = (message: string) => setToast({ isOpen: true, message, color: 'success', icon: checkmarkCircle });
  const showErrorToast = (message: string) => setToast({ isOpen: true, message, color: 'danger', icon: alertCircle });

  const handleAddProduct = async () => {
    if (!restaurantId) return showErrorToast("No se puede crear producto: falta ID de restaurante.");
    if (!newProduct.name || newProduct.price <= 0 || !newProduct.category) return showErrorToast("Nombre, precio positivo y categoría son obligatorios.");

    setFormLoading(true);
    try {
      const files: ProductFiles = {
        image: imageFile || undefined,
        modelUsdz: usdzFile || undefined,
        modelGlb: glbFile || undefined
      };
      const createdProduct = await productService.createProduct(restaurantId, newProduct, files);
      setProducts(prev => [createdProduct, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
      resetForm();
      showSuccessToast("¡Producto creado con éxito!");
    } catch (err: any) { showErrorToast(err.message); }
    finally { setFormLoading(false); }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    setFormLoading(true);
    try {
      const dataToUpdate: UpdateProductData = {
        name: editingProduct.name, description: editingProduct.description, price: editingProduct.price, category: editingProduct.category
      };
      const updatedProd = await productService.updateProduct(editingProduct.id, dataToUpdate);
      setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
      setEditingProduct(null);
      showSuccessToast("¡Producto actualizado!");
    } catch (err: any) { showErrorToast(err.message); }
    finally { setFormLoading(false); }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setFormLoading(true);
    try {
      await productService.deleteProduct(productToDelete);
      setProducts(prev => prev.filter(p => p.id !== productToDelete!.id));
      showSuccessToast("Producto eliminado.");
    } catch (err: any) { showErrorToast(err.message); }
    finally { setFormLoading(false); setProductToDelete(null); }
  };

  if (loading) return <div className="flex justify-center p-8"><IonSpinner name="crescent" /></div>;

  return (
    <>
      <style>{`.custom-input .native-input { padding: 1rem 0.5rem !important; }`}</style>
      <IonToast isOpen={toast.isOpen} message={toast.message} duration={3000} onDidDismiss={() => setToast({ ...toast, isOpen: false })} color={toast.color as any} icon={toast.icon} position="top" />
      <IonAlert isOpen={!!productToDelete} onDidDismiss={() => setProductToDelete(null)} header="Confirmar Eliminación" message={`¿Seguro que quieres eliminar "${productToDelete?.name}"?`} buttons={[{ text: 'Cancelar', role: 'cancel' }, { text: 'Eliminar', handler: handleDeleteProduct, cssClass: 'ion-color-danger' }]} />

      <IonModal isOpen={!!editingProduct} onDidDismiss={() => setEditingProduct(null)}>
        <IonHeader><IonToolbar><IonTitle>Editar: {editingProduct?.name}</IonTitle><IonButtons slot="end"><IonButton onClick={() => setEditingProduct(null)}>Cerrar</IonButton></IonButtons></IonToolbar></IonHeader>
        <IonContent className="ion-padding">
          {editingProduct && (
            <form onSubmit={e => { e.preventDefault(); handleUpdateProduct(); }}>
              <FormField label="Nombre" name="name" value={editingProduct.name} onIonChange={e => handleInputChange(e, setEditingProduct)} />
              <FormField component="textarea" label="Descripción" name="description" value={editingProduct.description || ''} onIonChange={e => handleInputChange(e, setEditingProduct)} />
              <FormField label="Precio" name="price" type="number" value={editingProduct.price} onIonChange={e => handleInputChange(e, setEditingProduct)} />
              <FormField component="select" label="Categoría" name="category" value={editingProduct.category} onIonChange={e => handleInputChange(e, setEditingProduct)}>
                <IonSelectOption value="Platos principales">Platos principales</IonSelectOption><IonSelectOption value="Entrantes">Entrantes</IonSelectOption><IonSelectOption value="Bebidas">Bebidas</IonSelectOption><IonSelectOption value="Postres">Postres</IonSelectOption>
              </FormField>
              <IonButton type="submit" expand="block" disabled={formLoading} className="mt-6 h-14 font-medium rounded-lg">{formLoading ? <IonSpinner /> : "Guardar Cambios"}</IonButton>
            </form>
          )}
        </IonContent>
      </IonModal>

      <div className="mb-6">
        <IonCardHeader><IonCardTitle className="text-xl">Agregar Producto</IonCardTitle></IonCardHeader>
        <IonCardContent>
          <form onSubmit={e => { e.preventDefault(); handleAddProduct(); }}>
            <IonGrid>
              <IonRow>
                <IonCol size="12" size-md="6"><FormField label="Nombre" name="name" value={newProduct.name} onIonChange={e => handleInputChange(e, setNewProduct)} placeholder="Ej: Lomo Saltado" /></IonCol>
                <IonCol size="12" size-md="6"><FormField label="Precio" name="price" type="number" value={newProduct.price} onIonChange={e => handleInputChange(e, setNewProduct)} placeholder="Ej: 12.99" /></IonCol>
              </IonRow>
              <IonRow><IonCol><FormField component="textarea" label="Descripción" name="description" value={newProduct.description || ''} onIonChange={e => handleInputChange(e, setNewProduct)} placeholder="Tiernos trozos de lomo con..." /></IonCol></IonRow>
              <IonRow><IonCol><FormField component="select" label="Categoría" name="category" value={newProduct.category} onIonChange={e => handleInputChange(e, setNewProduct)}>
                <IonSelectOption value="">Seleccione una categoría</IonSelectOption><IonSelectOption value="Platos principales">Platos principales</IonSelectOption><IonSelectOption value="Entrantes">Entrantes</IonSelectOption><IonSelectOption value="Bebidas">Bebidas</IonSelectOption><IonSelectOption value="Postres">Postres</IonSelectOption>
              </FormField></IonCol></IonRow>
              <IonRow className="ion-align-items-center ion-justify-content-center">
                <IonCol size="12" size-md="4" className="flex flex-col items-center mb-2 md:mb-0">
                  <IonButton fill="outline" onClick={() => imageInputRef.current?.click()} className="w-full">Seleccionar Imagen</IonButton>
                  {imageFile && <span className="text-sm text-gray-500 mt-2 truncate max-w-full px-2">{imageFile.name}</span>}
                  <input ref={imageInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setImageFile)} />
                </IonCol>
                <IonCol size="12" size-md="4" className="flex flex-col items-center mb-2 md:mb-0">
                  <IonButton fill="outline" onClick={() => usdzInputRef.current?.click()} className="w-full">Seleccionar USDZ</IonButton>
                  {usdzFile && <span className="text-sm text-gray-500 mt-2 truncate max-w-full px-2">{usdzFile.name}</span>}
                  <input ref={usdzInputRef} type="file" className="hidden" accept=".usdz" onChange={(e) => handleFileChange(e, setUsdzFile)} />
                </IonCol>
                <IonCol size="12" size-md="4" className="flex flex-col items-center">
                  <IonButton fill="outline" onClick={() => glbInputRef.current?.click()} className="w-full">Seleccionar GLB</IonButton>
                  {glbFile && <span className="text-sm text-gray-500 mt-2 truncate max-w-full px-2">{glbFile.name}</span>}
                  <input ref={glbInputRef} type="file" className="hidden" accept=".glb,.gltf" onChange={(e) => handleFileChange(e, setGlbFile)} />
                </IonCol>
              </IonRow>
              <IonButton type="submit" expand="block" disabled={formLoading} className="mt-6 h-14 font-medium rounded-lg">
                {formLoading ? <IonSpinner /> : <><IonIcon icon={addOutline} slot="start" />Agregar Producto</>}
              </IonButton>
            </IonGrid>
          </form>
        </IonCardContent>
      </div>

      <div>
        <IonCardHeader><IonCardTitle className="text-xl">Mis Productos ({products.length})</IonCardTitle></IonCardHeader>
        <IonCardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tienes productos en tu menú. ¡Añade el primero!</div>
          ) : (
            <IonList lines="none" className="space-y-2">
              {products.map(product => {
                // <-- MEJORA DE ESTABILIDAD: Obtenemos la URL y la verificamos antes de usarla.
                const imageUrl = product.image_path ? supabase.storage.from('logos').getPublicUrl(product.image_path).data.publicUrl : null;
                return (
                  <IonItem key={product.id} className="rounded-lg shadow-sm">
                    <IonAvatar slot="start" className="w-16 h-16 bg-gray-100 rounded-lg mr-4 flex items-center justify-center">
                      {/* Ahora, solo mostramos la imagen si la URL es válida */}
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.name} className="object-cover w-full h-full" />
                      ) : (
                        <IonIcon icon={cubeOutline} className="text-3xl text-gray-400" />
                      )}
                    </IonAvatar>
                    <IonLabel>
                      <h2 className="font-bold text-gray-800">{product.name}</h2>
                      <p className="text-green-600 font-semibold">${product.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                    </IonLabel>
                    <IonButton fill="clear" onClick={() => setEditingProduct(product)}><IonIcon slot="icon-only" icon={createOutline} /></IonButton>
                    <IonButton fill="clear" color="danger" onClick={() => setProductToDelete(product)}><IonIcon slot="icon-only" icon={trashOutline} /></IonButton>
                  </IonItem>
                )
              })}
            </IonList>
          )}
        </IonCardContent>
      </div>
    </>
  );
};

export default MenuManagement;
