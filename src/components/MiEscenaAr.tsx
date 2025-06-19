// src/components/MiEscenaAR.tsx

import React from 'react';
// Recuerda que A-Frame se carga desde public/index.html
import { Entity, Scene } from 'aframe-react';

// Hacemos que el componente acepte la URL del modelo como una propiedad (prop)
interface MiEscenaARProps {
  modelUrl: string;
}

const MiEscenaAR: React.FC<MiEscenaARProps> = ({ modelUrl }) => {
  return (
    <Scene
      embedded
      vr-mode-ui="enabled: false"
      ar-mode-ui="enabled: true"
      ar-hit-test="enabled: true;" // Para colocar la escena al tocar
      renderer="colorManagement: true; physicallyCorrectLights: true;"
      style={{ width: '100%', height: '100%' }}
    >
      {/* 1. Almacén de Recursos (Assets) 📦 */}
      {/* Aquí cargamos los modelos para que estén listos para usar. */}
      <a-assets>
        <a-asset-item id="miModelo" src={modelUrl}></a-asset-item>
      </a-assets>

      {/* 2. Iluminación de la Escena 💡 */}
      {/* Sin luces, todo se vería negro. */}
      <Entity light={{ type: 'ambient', color: '#FFF', intensity: 0.5 }} />
      <Entity light={{ type: 'directional', color: '#FFF', intensity: 1 }} position="-1 2 1" />

      {/* 3. El Contenedor de tu Escena 🎭 */}
      {/* Todo lo que pongas aquí dentro aparecerá cuando toques la pantalla en AR. */}
      <Entity id="escena-principal" ar-hit-test-target visible="false">

        {/* --- ¡AQUÍ EMPIEZA LA MAGIA! CONSTRUYE TU ESCENA --- */}

        {/* TU MODELO PRINCIPAL */}
        <Entity
          gltf-model="#miModelo"
          position="-0.7 0 0" // x y z (izquierda/derecha, arriba/abajo, adelante/atrás)
          scale="0.5 0.5 0.5"
          shadow="cast: true"
        />

        {/* UN TEXTO EN 3D */}
        <Entity
          text={{
            value: '¡Mi Escena!',
            align: 'center',
            color: '#E63946',
            width: 4,
          }}
          position="0.7 0.5 0"
        />

        {/* UNA CAJA AZUL (¡un objeto extra!) */}
        <Entity
          geometry={{ primitive: 'box', width: 0.5, height: 0.5, depth: 0.5 }}
          material={{ color: '#457B9D' }} // Un color azul
          position="0 0.25 -1" // Un poco detrás de los otros objetos
          shadow="cast: true"
        />

        {/* --- FIN DE TU ESCENA --- */}
      </Entity>

      {/* La cámara para la vista previa 3D */}
      <Entity primitive="a-camera" />
    </Scene>
  );
};

export default MiEscenaAR;
