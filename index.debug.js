// Intercept Object.defineProperty to catch the error
const originalDefineProperty = Object.defineProperty;
Object.defineProperty = function(obj, prop, descriptor) {
  try {
    return originalDefineProperty.call(this, obj, prop, descriptor);
  } catch (error) {
    console.error('ERROR in defineProperty:', {
      property: prop,
      error: error.message,
      stack: new Error().stack
    });
    // Try to continue anyway
    try {
      obj[prop] = descriptor.value;
    } catch (e) {
      // Ignore
    }
    return obj;
  }
};

// Now load the actual app
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
