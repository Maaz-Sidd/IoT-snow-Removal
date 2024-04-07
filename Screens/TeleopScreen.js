import {View, Text, Dimensions, Image, Button, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native'
import {WebView} from 'react-native-webview'
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ReactNativeJoystick } from "@korsolutions/react-native-joystick";
import ROSLIB from 'roslib';
import {useState, useEffect} from 'react'
import Slider from '@react-native-community/slider';


export default function TeleopScreen({route}){
    const windowWidth = Dimensions.get('window').width;
    const {rosConnection} = route.params;
    const data = route.params?.data || '';
    const [rendered, setRendered] = useState(false); 
    const [isMapping, setIsMapping] = useState(false);
    const [isPath, setIsPath] = useState(false);
    const [isAuger, setIsAuger] = useState(false);
 
    useEffect(() => { 
      const timer = setTimeout(() => { 
       setRendered(true); 
      }, 5000); 
 
      return () => clearTimeout(timer);
    }, [rendered, isMapping, isPath]); 

    var talker = new ROSLIB.Topic({
      ros : rosConnection,
      name : '/chatter',
      messageType : 'std_msgs/String'
    });




    var cmdVel = new ROSLIB.Topic({
        ros : rosConnection,
        name : 'teleop/cmd_vel',
        messageType : 'geometry_msgs/Twist'
      });
    var Chute = new ROSLIB.Topic({
        ros : rosConnection,
        name : 'chute/control',
        messageType : 'std_msgs/Int32'
    });
    var Auger = new ROSLIB.Topic({
      ros : rosConnection,
      name : 'auger/control',
      messageType : 'std_msgs/Int32'
  });

    const sendMessage = (message) => {
      const rosMessage = new ROSLIB.Message({
       data: message
      });
      talker.publish(rosMessage);
    };
    useEffect(() =>{
      sendMessage('teleop');
    }, []);


    const topicsClient = new ROSLIB.Service({
      ros: rosConnection,
      name: '/rosapi/topics',
      serviceType: 'rosapi/Topics'
  });

  // Request topic list
  /*const request = new ROSLIB.ServiceRequest();
  topicsClient.callService(request, function(result) {
      console.log('Topics:', result.topics);
  });*/
  
      
    const MoveRobot = (data) => {
        var twist = new ROSLIB.Message({
            linear : {
              x : data.position.y - 100,
            },
            angular : {
              z : data.position.x - 105,
            }
          });
          cmdVel.publish(twist);
      };

    const StopRobot = (data) => {
        var twist = new ROSLIB.Message({
            linear : {
              x : data.position.y,
            },
            angular : {
              z : data.position.x, 
            }
          });
          cmdVel.publish(twist);
      };

      const controlChute = (value) => {
        const intValue = parseInt(value)
        var angle = new ROSLIB.Message({
          data: intValue
        })
        Chute.publish(angle);
        console.log(intValue);
      };

      const handleMapping = () => {
        setIsMapping(!isMapping);
        if (isMapping) {
          const rosMessage = new ROSLIB.Message({
            data: 'done_mapping'
           });
           talker.publish(rosMessage);
           setRendered(false);
        } else {
          const rosMessage = new ROSLIB.Message({
            data: 'mapping'
           });
           talker.publish(rosMessage);
           setRendered(false);
        }
      };

      const handlePath = () => {
        setIsPath(!isPath);
        if (isPath) {
          const rosMessage = new ROSLIB.Message({
            data: 'done_path'
           });
           talker.publish(rosMessage);
        } else {
          const rosMessage = new ROSLIB.Message({
            data: 'path_planning'
           });
           talker.publish(rosMessage);
        }
      };

      const handleAuger = () => {
        setIsAuger(!isAuger);
        if (isAuger) {
          const rosMessage = new ROSLIB.Message({
            data: 0
           });
           Auger.publish(rosMessage);
        } else {
          const rosMessage = new ROSLIB.Message({
            data: 1
           });
           Auger.publish(rosMessage);
        }
      };

    

      return(
        <View style={{flex:1, paddingTop: 45}}>
            <Image resizeMode = "contain" blurRadius = {70} style={{position:'absolute', flex: 1, paddingTop: 60}}
          source={require('../assets/Appbackground.png')}/>
          {rendered? ( <WebView
                    source={{ uri: `http://${data}:8080/stream_viewer?topic=/camera/color/image_raw&type=mjpeg&width=350&height=200` }}
                    style={{ width: windowWidth + 200, height: 240 }}/>
                        ):(  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80}}>
                                <ActivityIndicator size={75} color="#0000ff" />
                            </View> )  }
            
                  <View style={styles.innercontainer} >
                  <TouchableOpacity style={{backgroundColor: isMapping ? 'red' : 'rgba(229,155,32,0.75)',  
                  borderColor: 'rgba(255,255,255,0.5)', borderRadius: 50, borderWidth: 2, width: 100, height: 40, alignItems: 'center'}} onPress={handleMapping}>

                    <Text style={{color: 'white', textAlign: 'center', fontWeight:'bold', fontSize: 16, paddingTop: 6, marginRight: 5, marginTop: 2}}> {isMapping ? 'Stop Mapping' : 'Map'} </Text>

                  </TouchableOpacity>

                  <TouchableOpacity style={{backgroundColor: isPath ? 'red' : 'rgba(229,155,32,0.75)', borderColor: 'rgba(255,255,255,0.5)', borderRadius: 50, borderWidth: 2, 
                  width: 100, height: 40, alignItems: 'center'}} onPress={handlePath}>
                  <Text style={{color: 'white', textAlign: 'center', fontWeight:'bold', fontSize: 16, paddingTop: 6, marginRight: 5, marginTop: 2}}> {isPath ? 'Stop path' : 'Path'} </Text>
                  </TouchableOpacity>
                </View>

            <View style={{flex: 1,alignItems: 'center', justifyContent: 'center', flexDirection: 'row', alignContent: 'center'}}>
                <GestureHandlerRootView style={{}}>
                    <ReactNativeJoystick color="#06b6d4" radius={windowWidth/3} onMove={MoveRobot} onStop={StopRobot}/>
                </GestureHandlerRootView>
            </View>

            <View style= {styles.innercontainer_2} >
            <TouchableOpacity style={{backgroundColor: isAuger ? 'red' : 'rgba(229,155,32,0.75)',  
                  borderColor: 'rgba(255,255,255,0.5)', borderRadius: 50, borderWidth: 2, width: 100, height: 40, alignItems: 'center'}} onPress={handleAuger}>

                    <Text style={{color: 'white', textAlign: 'center', fontWeight:'bold', fontSize: 16, paddingTop: 6, marginRight: 5, marginTop: 2}}> {isAuger ? 'Auger off' : 'Auger'} </Text>

                  </TouchableOpacity>


            </View>

            <View style= {styles.innercontainer_3} >

            <Text style={{fontSize: 16, color:'white', fontWeight:'bold'}}>
              Chute angle:
            </Text>
            <Slider
                style={{width: windowWidth - 20, height: 40}}
                minimumValue={-90}
                maximumValue={90}
                value={0}
                tapToSeek={true}
                minimumTrackTintColor="orange"
                maximumTrackTintColor="cyan"
                onSlidingComplete={(value) =>
                  controlChute(value)
                }
                  />
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
  innercontainer:{
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    //marginHorizontal: 350
    justifyContent: 'space-around',
    marginBottom:1,
    paddingLeft: 6
  },     
  innercontainer_2:{
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    //marginHorizontal: 350
    justifyContent: 'space-around',
    paddingBottom: 10
  },
  innercontainer_3:{
    marginTop: 1,
    alignItems: 'center',
    height: 40,
    //marginHorizontal: 350
    justifyContent: 'space-around',
  }
}

)