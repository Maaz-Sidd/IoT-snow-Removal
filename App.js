import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from "./Screens/HomeScreen"
import TeleopScreen from "./Screens/TeleopScreen"
import LoginScreen from './Screens/LoginScreen';



const stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <stack.Navigator screenOptions={{ headerShown: false  }}>
        <stack.Screen name ="Login" component={LoginScreen}/>
        <stack.Screen name ="Home" component={HomeScreen}/>
        <stack.Screen name ="TeleopScreen" component={TeleopScreen}/>
      </stack.Navigator>
    </NavigationContainer>
  );
}