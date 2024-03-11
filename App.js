import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import GameScreen from './GameScreen';
import * as SecureStore from 'expo-secure-store';
import { Image, Animated, Dimensions } from 'react-native';

const Stack = createNativeStackNavigator();
const screenWidth = Dimensions.get('window').width; // Get device width
const screenHeight = Dimensions.get('window').height; // Get device height

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = new Animated.Value(1); // Initial opacity set to 1

  useEffect(() => {
    async function initialSetup() {
      const apiKeyExists = await SecureStore.getItemAsync('api_key');
      if (!apiKeyExists) {
        const ApiKey = "0gfxo3te733p0f4ls6ndygi1q1v471pruzua2txle4ortus0x"; // Set API key in secure store
        await SecureStore.setItemAsync('api_key', ApiKey);
      }
    }

    initialSetup();
    // Create splash screen animation
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => setIsLoading(false));
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  // Show splash screen during load time
  if (isLoading) {
    return (
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <Image source={require('./assets/splashscreen.JPG')} style={{ width: screenWidth, height: screenHeight }} resizeMode="cover" />
      </Animated.View>
    );
  }
  // Define navigation components
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={({ route }) => ({ 
            title: 'anaGrams', 
            headerStyle: {backgroundColor: '#335381'},
            headerTintColor: '#fff',
            headerTitleStyle: {fontWeight: 'bold'}
          })}/>
        <Stack.Screen name="Game" component={GameScreen} options={({ route }) => ({ 
            title: route.params.difficulty.level.toUpperCase(), 
            headerStyle: {backgroundColor: '#335381'},
            headerTintColor: '#fff',
            headerTitleStyle: {fontWeight: 'bold'}
          })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
