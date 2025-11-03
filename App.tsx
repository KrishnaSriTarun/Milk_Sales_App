import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import User from './src/pages/RegisterForm';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux'
import { store } from './src/store';
import Login from './src/pages/Login';
import Main from './src/pages';

const queryClient = new QueryClient();
const Tab = createBottomTabNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Main />
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;
