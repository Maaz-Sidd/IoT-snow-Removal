import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Image, Alert} from 'react-native';
import HomeScreen from './HomeScreen';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ipaddress, setipaddress] = useState('');
  

  /*const passvalue = () => {
    navigation.navigate('Home', { data: ipaddress });
  };*/

 const _login = () => {
   // Hardcoded username and password for demonstration purposes
   const hardcodedUsername = 'John';
   const hardcodedPassword = '1234';
   

   if (username === hardcodedUsername && password === hardcodedPassword) {
     console.log('Login successful!');
     // Navigate to the MainScreen or HomePage equivalent in React Native
     // Replace the 'MainScreen' with your desired component
     navigation.navigate('Home', {data: ipaddress});
   } else {
     console.log('Login failed. Please check your credentials.');


     Alert.alert('The Username or Password are not correct!')


   }
 };

  return (

   <View style={styles.container}>
  
      <Image resizeMode = "contain" blurRadius = {70} style={{position:'absolute', flex: 1, paddingTop: 60}}
        source={require('../assets/Appbackground.png')}/>
      <Image source={require('../assets/Robot.png')} style = {{borderRadius: 60, marginBottom:35 ,
        resizeMode:"cover",height: "60%", width: "100%"}} />


     <View style={styles.inner}>
       <Text style={styles.title}>Login to your account</Text>
           <TextInput
             style={styles.input}
             placeholder="Username"
             placeholderTextColor={'lightgrey'}
             value={username}
             onChangeText={(text) => setUsername(text)}
           />
           <TextInput
             style={styles.input}
             placeholder="Password"
             placeholderTextColor={'lightgrey'}
             secureTextEntry
             value={password}
             onChangeText={(text) => setPassword(text)}
           />
           <TextInput style={styles.input}
             placeholder="IP Address"
             placeholderTextColor={'lightgrey'}
             value={ipaddress}
             onChangeText={setipaddress}
             
             >

            </TextInput>

           <Button title="Login" onPress={_login}/>
           
       </View>

   </View>
 );
  
};

const styles = StyleSheet.create({
  container: {
   flex: 1,
   justifyContent: 'center',
   padding: 20,
   backgroundColor: 'black',
 },
 title: {
   fontSize: 24,
   fontWeight: 'bold',
   textAlign: 'center',
   marginBottom: 20,
   marginTop: 1,
  
   color: 'white',


 },
  inner:{
   marginTop:1,
   //backgroundColor: 'blue',
 },


 input: {
   height: 45,
   borderColor: 'grey',
   borderWidth: 1,
   borderRadius: 8,
   marginBottom: 10,
   paddingHorizontal: 8,
   color: 'white',
 },




});


export default LoginScreen;