import {View, Text, Dimensions, Image, Button} from 'react-native'
import {WebView} from 'react-native-webview'
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ReactNativeJoystick } from "@korsolutions/react-native-joystick";
import ROSLIB from 'roslib';


export default function TeleopScreen({route}){
    const windowWidth = Dimensions.get('window').width;
    const {rosConnection} = route.params;
    const data = route.params?.data || '';
    
    var cmdVel = new ROSLIB.Topic({
        ros : rosConnection,
        name : '/cmd_vel',
        messageType : 'geometry_msgs/Twist'
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
            <WebView
                    source={{ uri: `http://${data}:8080/stream_viewer?topic=/image_view/output&type=mjpeg&width=350&height=200` }}
                    style={{ width: windowWidth + 200, height: 240 }}
                  />
            <View>
                
            </View>
            <View style={{flex: 1,alignItems: 'center', justifyContent: 'center', flexDirection: 'row', alignContent: 'center'}}>
                <GestureHandlerRootView style={{}}>
                    <ReactNativeJoystick color="#06b6d4" radius={windowWidth/3} onMove={MoveRobot} onStop={StopRobot} />
                </GestureHandlerRootView>
            </View>
        </View>
    );
};
