import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import User from './src/pages/RegisterForm';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux'
import { store } from './src/store';
import Main from './src/pages';
import Custom from './src/pages/Custom/custom';

const queryClient = new QueryClient();
const Tab = createBottomTabNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Custom />
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;
