// src/custom.d.ts

// Esto es opcional, solo si necesitas importar el elemento model-viewer directamente
// como un módulo en lugar de que sea global
declare module "@google/model-viewer/lib/model-viewer-element" {
  export interface ModelViewerElement extends HTMLElement {
    // Define las propiedades y métodos específicos de la instancia de model-viewer
    src: string;
    iosSrc: string;
    alt: string;
    ar: boolean;
    arModes: string;
    arScale: string;
    cameraControls: boolean;
    shadowIntensity: string;
    // ... (agrega más si necesitas interactuar con la instancia directamente)
  }
  global {
    interface HTMLElementTagNameMap {
      "model-viewer": ModelViewerElement;
    }
  }
}


// Esto es CRÍTICO para que TypeScript reconozca <model-viewer> en JSX
declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      alt?: string;
      ar?: boolean;
      'ar-modes'?: string; // Atributos con guiones deben ser strings
      'ar-scale'?: string; // 'auto' o 'fixed'
      'ios-src'?: string;
      'camera-controls'?: boolean;
      'shadow-intensity'?: string;
      'auto-rotate'?: boolean;
      'auto-rotate-delay'?: string;
      'interaction-prompt'?: string;
      'camera-orbit'?: string;
      'exposure'?: string;
      'field-of-view'?: string;
      'loading'?: 'eager' | 'lazy';
      'reveal'?: 'auto' | 'interaction';
      // ... (añade aquí cualquier otro atributo de model-viewer que uses en tu código JSX)
      children?: React.ReactNode; // Si esperas que tenga elementos hijos, como el botón AR
    };
  }
}
