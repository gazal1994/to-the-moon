import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';

import { store } from './src/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LanguageProvider } from './src/contexts';
import { UserProvider } from './src/contexts/UserContext';
import i18n from './src/i18n';

// Suppress SSRProvider warnings in React 18
if (__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      args[0] && 
      typeof args[0] === 'string' && 
      args[0].includes('SSRProvider')
    ) {
      return;
    }
    originalWarn(...args);
  };
}

export default function App() {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <UserProvider>
            <SafeAreaProvider>
              <RootNavigator />
            </SafeAreaProvider>
          </UserProvider>
        </LanguageProvider>
      </I18nextProvider>
    </Provider>
  );
}