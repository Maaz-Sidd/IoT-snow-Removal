import {View, Text, Dimensions, Image, Button, ActivityIndicator} from 'react-native'
import {WebView} from 'react-native-webview'
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ReactNativeJoystick } from "@korsolutions/react-native-joystick";
import ROSLIB from 'roslib';
import {useState, useEffect} from 'react'


export default function TeleopScreen({route}){
    const windowWidth = Dimensions.get('window').width;
    const {rosConnection} = route.params;
    const data = route.params?.data || '';
    const [rendered, setRendered] = useState(false); 
 
    useEffect(() => { 
      const timer = setTimeout(() => { 
       setRendered(true); 
      }, 1500); 
 
      return () => clearTimeout(timer);
    }, []); 

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

    const sendMessage = (message) => {
      const rosMessage = new ROSLIB.Message({
       data: message
      });
      talker.publish(rosMessage);
    };
    sendMessage('teleop');

    const topicsClient = new ROSLIB.Service({
      ros: rosConnection,
      name: '/rosapi/topics',
      serviceType: 'rosapi/Topics'
  });

  // Request topic list
  const request = new ROSLIB.ServiceRequest();
  topicsClient.callService(request, function(result) {
      console.log('Topics:', result.topics);
  });
  
      
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
            
            <View style={{flex: 1,alignItems: 'center', justifyContent: 'center', flexDirection: 'row', alignContent: 'center'}}>
                <GestureHandlerRootView style={{}}>
                    <ReactNativeJoystick color="#06b6d4" radius={windowWidth/3} onMove={MoveRobot} onStop={StopRobot} />
                </GestureHandlerRootView>
            </View>
        </View>
    );
};
