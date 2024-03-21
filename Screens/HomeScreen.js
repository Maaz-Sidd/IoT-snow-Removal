  import {StyleSheet, View, ActivityIndicator, ScrollView, 
    StatusBar, Alert, Pressable, Text, Image, ImageBackground, 
    Button, Modal, FlatList, TextInput, RefreshControl, Switch, Dimensions, TouchableOpacity} from 'react-native'
  import {useEffect, useState, React, useLayoutEffect, route, useCallback, useRef} from 'react'
  import {debounce} from 'lodash';
  import axios from 'axios';
  import { SafeAreaView } from 'react-native';
  import ROSLIB from 'roslib';
  import {WebView} from 'react-native-webview'
  import { StackRouter } from '@react-navigation/native';
  import { useRoute } from '@react-navigation/native';  
  import { storeData, getData } from '../Utils/asyncStorage';

    
  const apiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
  const apiUrl = 'https://api.weatherapi.com/v1/forecast.json';
  const searchUrl = 'https://api.weatherapi.com/v1/search.json';
  


export default function HomeScreen ({navigation}){
      const [isLoading, setLoading] = useState(true);
      const [weatherData, setWeatherData] = useState({});
      const [locations, setLocations] = useState([]);
      const [Search, setSearch] = useState(false);
      const [robotStatus, setrobotStatus] = useState("");
      const [statusColor, setstatusColor] = useState('red');
      const currentTime = new Date();
      const windowWidth = Dimensions.get('window').width;
      const [refreshing, setRefreshing] = useState(false);
      const [imageData, setImageData] = useState(null);
      const [connection, setConnection] = useState(false);
      const [rosConnection, setRosConnection] = useState(null);
      const route = useRoute();
      const [placeholderText, setPlaceholderText] = useState('Search a City');
      const [locationSelected, setlocationSelected] = useState(false);
      
      const data = route.params?.data || '';
    

      const ros = useRef(null);
      const location = useRef(null);

  
    // Function to handle closing ROS connection
    const closeRosConnection = () => {
      if (ros.current && ros.current.isConnected) {
        ros.current.close();
        setConnection(true);
        console.log('ROS connection closed');
      } else {
        console.log('No active ROS connection to close');
      }
    };
    
      
    useEffect(() => {
        getHourlyWeather(apiKey, 1);
        setRefreshing(true);
        if (ros.current && ros.current.isConnected) ros.current.close();
  
        ros.current = new ROSLIB.Ros({
          url : `ws://${data}:9090`
        });
        //Globals.ros = ros;
      
        ros.current.on('connection', function() {
          console.log('Connected to Rosbridge server.');
          setRosConnection(ros.current);
          setrobotStatus("online");
          setstatusColor('limegreen');
          setConnection(false);
          var talker = new ROSLIB.Topic({
            ros : ros.current,
            name : '/chatter',
            messageType : 'std_msgs/String'
          });
          
          const sendMessage = (message) => {
            const rosMessage = new ROSLIB.Message({
             data: message
            });
            talker.publish(rosMessage);
          };
          location_(ros.current);
          sendMessage('home');
        });
      
        ros.current.on('error', function(error) {
          console.log('Error connecting to websocket server: ', error);
          setrobotStatus("error connecting to robot");
          setstatusColor('red');
          setConnection(true);
        });
      
        ros.current.on('close', function() {
          console.log('Connection to websocket server closed.');
          setrobotStatus("Ofline");
          setstatusColor('red');
          setConnection(true);
        });
    
        
          setTimeout(() => {
          setRefreshing(false);
       }, 2000);
      
        return () => {
          closeRosConnection();
        };
      }, []); 
    
      const location_ = (ros) => {
        location.current = new ROSLIB.Topic({
          ros : ros,
          name : '/user_location',
          messageType : 'std_msgs/String'
        });
      };
           
      const handleLocation = (loc) => {
        setlocationSelected(true);
        setLocations([]);
        setPlaceholderText("Search a City");
        console.log(loc.name);
        
        
        const location_msg = new ROSLIB.Message({
          data: loc.name,
        });
        
        location.current.publish(location_msg);  
        
        storeData('city', loc.name);
        getHourlyWeather( apiKey, 1);
      }

  
  
      //refreshControl={<RefreshControl refreshing={refreshing} onRefresh={Rosconnection}
      const handleSearch = async (loc)=>{
        setSearch(true);
        if (loc.length > 2){
          try {
            const response = await axios.get(`${searchUrl}?key=${apiKey}&q=${loc}`);
            const city = await response.data;
            setLocations(city);
          } catch (error) {
            console.error('Error fetching location data:', error);
            throw error;
          } finally{
            setLoading(false);
          }
          
        }
        
      };
      const handleTextDebounce = useCallback(debounce(handleSearch, 200), []);
    
      const getHourlyWeather = async ( apiKey, days= 1) => {
        let myCity = await getData('city');
        let cityName = 'oshawa';
        if (myCity) cityName = myCity;
        try {
          const response = await axios.get(`${apiUrl}?key=${apiKey}&q=${cityName}&days=${days}&aqi=no&alerts=no`);
          console.log("got data successfully!")
          const Data = await response.data;
          setWeatherData(Data);
          //console.log(weatherData);
        } catch (error) {
          console.error('Error fetching weather data:', error);
          throw error;
        } finally{
          setLoading(false);
        }
      };
      
      
      const hourlyTemperature = weatherData?.forecast?.forecastday[0]?.hour
        .filter((hourData) => new Date(hourData.time).getTime() >= currentTime.getTime())
        .map((hourData) => {
          // Parse the time and convert to 12-hour clock format
          const time = new Date(hourData?.time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          });
          
      
          return (
            <View key={hourData.time_epoch}  style={styles.forecastItems}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>{time}</Text>
              <Image source={{uri: 'https:'+hourData?.condition?.icon}}
                  style={styles.forecastPic} />
              <Text style={{color: 'white', fontWeight: 'bold'}}>{hourData?.temp_c}°C</Text>
              <Text style={{color: 'white', fontWeight: 'bold', alignContent: 'center'}}>{hourData?.condition.text}</Text>
              <Text style={{color: 'white', fontWeight: 'bold'}}>{hourData?.precip_mm}</Text>
            </View>
          );
        });
    //refreshControl={<RefreshControl refreshing={refreshing} onRefresh={Rosconnection}/>}
      return(
        <ScrollView contentContainerStyle = {{flexGrow: 1}} style={styles.container} > 
          <Image resizeMode = "contain" blurRadius = {70} style={{position:'absolute', flex: 1}}
          source={require('../assets/Appbackground.png')}/>
            <View style={{alignItems:'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginLeft: 6, marginTop: 60}}>
              <View style={[styles.forecastItems, {paddingBottom: 6, width: 150, marginBottom:6}]}>
                  <Text style={{fontSize: 15, color: statusColor}}>Robot Status: {robotStatus}, On charge</Text>
                </View>
                <View style={[styles.forecastItems, {marginBottom: 6, alignSelf:'flex-end'}]}>
                  <Text style={{fontSize: 15, color: 'white', backgroundColor:'green'}}>Robot Battery: 90%</Text>
                </View>
  
            </View>
            <View style={[styles.searchBox, {marginTop: 10}]}>
              <TextInput 
                onChangeText={handleTextDebounce} 
                placeholder={placeholderText} 
                value={locations.name}
                placeholderTextColor={'lightgray'} 
                style={styles.searchBar}
              />
            </View>
            <View>
              { 
                locations.length >0 && Search ?(
                  <View style={{  position: 'absolute', flex: 1, alignSelf: 'center',  width: '95%', backgroundColor: 'rgba(51,68,71,0.90)', marginTop: 4, borderRadius: 16, zIndex: 1}}> 
                    {
                      locations.map((loc, index) => {
                        let showBorder = index + 1 != locations.length;
                        return (
                          <TouchableOpacity
                          key ={index}
                          onPress={()=>handleLocation(loc)}
                          style={{flexDirection: 'row', alignItems: 'center', paddingRight: 4, paddingLeft: 4, marginBottom: 1, borderBottomColor: 'white', borderBottomWidth: showBorder? 1: 0}}>
                            <Text style={{color: 'white', fontSize: 22, marginLeft: 2}}> {loc?.name}, {loc?.country} </Text>

                          </TouchableOpacity>
                        )
                      })
                    }
                  
                  </View>
                ):null

              }
            
            </View>
            
            
            {isLoading ? (
              <Text>Loading...</Text>
                ) : (
              <View style={{alignContent: 'center', alignItems: 'center', marginTop: 10}}>
                <Text style={{fontSize: 30, fontWeight: 'bold', color: 'white', marginRight: 5, textTransform: 'uppercase'}}> {weatherData?.location?.name}, {weatherData?.location?.country}</Text>
                <Image source={{uri: 'https:'+weatherData?.current?.condition?.icon}}
                      style={styles.currentPic}/>
                <Text style={{fontSize: 50, fontWeight: 'bold', color: 'white', marginRight: 5}}> {weatherData?.current?.temp_c}°C </Text>
                <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white', marginRight: 5, textTransform: 'uppercase'}}> {weatherData?.current?.condition.text}</Text>
                <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white', marginRight: 5}}> PRECIPITATION: {weatherData?.current?.precip_mm} mm </Text>
                
              </View>)
            }
            <View style={styles.forecastContainer}>
              <ScrollView   
                horizontal
                contentContainerStyle={{paddingHorizontal: 15}}
                showsHorizontalScrollIndicator={false}>
                  {hourlyTemperature}
                </ScrollView>
              </View>
              <View style={styles.innercontainer} >
                  <TouchableOpacity disabled={connection} style={{backgroundColor: 'rgba(229,155,32,0.75)',  
                  borderColor: 'rgba(255,255,255,0.5)', borderRadius: 16, borderWidth: 2, width: 200, height: 40, alignItems: 'center'}}
                  onPress={()=> navigation.navigate("TeleopScreen", {rosConnection, data})}>
                    <Text style={{color: 'white', textAlign: 'center', fontWeight:'bold', fontSize: 16, paddingTop: 6}}>Teleoperation</Text>
                  </TouchableOpacity>
                  <Text style={{color: 'white', textAlign: 'center', fontWeight:'bold', fontSize: 16, marginTop: 2}}> Automatic Mode: </Text>
                  <Switch/>
                </View>
                <TouchableOpacity
                  title= "Logout" style={{backgroundColor: 'rgba(20,53,239,0.75)',  
                  borderColor: 'rgba(255,255,255,0.5)', borderRadius: 16, borderWidth: 2, height: 40, alignItems: 'center', marginRight: 6, marginLeft: 6, paddingTop: 6}}
                  onPress={() => navigation.navigate('Login')}> 
                  <Text style={{color: 'white', textAlign: 'center', fontWeight:'bold', fontSize: 16, marginTop: 2}}> LOGOUT</Text>
                </TouchableOpacity>
                     
              
        </ScrollView>
      );
      
    };
    
    const styles = StyleSheet.create({
      container: {
        //flex: 1,
        //paddingTop: 60,
      }, 
      forecastContainer: {
        alignItems: 'left',
        justifyContent: 'left',
        marginBottom: 2,
        marginTop: 30,
      },
      currentPic:{
        marginTop: 6,
        width: 100,
        height: 100,
      },
      forecastPic:{
        width: 60,
        height: 60,
      },
      forecastItems: {
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 16,
        borderWidth: 2,
        width: 110,
        borderRadius: 10,
        paddingTop: 3,
        marginTop: 1,
        marginRight: 6,
        backgroundColor: 'rgba(0,0,0,0.15)',
      },
      searchBox:{
        backgroundColor: 'rgba(255,255,255,0.15)',
        height: '7%',
        marginRight: 4,
        marginLeft: 4,
        paddingLeft: 5,
        paddingRight: 5,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems:'center',
        borderRadius: 50,
      },
      innercontainer:{
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        //marginHorizontal: 350
        justifyContent: 'space-around',
        marginBottom:25,
        paddingLeft: 6
      },     
      searchBar: {
        paddingLeft: 6,
        flex: 1,
        height: 15,
        paddingBottom: 1,
        color: 'white',
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 1,
       
        color: 'white',
     
     
      },
    }
  );