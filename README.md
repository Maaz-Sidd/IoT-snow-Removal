# Introduction
#### Welcome to our project! We're thrilled to introduce an innovative interactive user interface developed for an IoT Autonomous Snow Removal Robot, a venture spearheaded by our capstone group. Leveraging the power of React Native and WebSocket connection via ROSbridge server, our project offers a seamless integration of technology.

At its core, the robot utilizes ROS on a laptop or mini PC as a high-level controller for mapping and autonomous algorithms, complemented by an Arduino Mega serving as a low-level controller for essential functions such as motor control, chute, and auger operation. Our solution also taps into weather data from https://www.weatherapi.com/ to provide real-time information for both users and automated scheduling of snow removal tasks.

To enhance user experience, we've integrated Arduino cloud API into the app, allowing for the display of the robot's battery percentage, meticulously calculated by an onboard ESP-32 and battery sensor.

Our app empowers users with teleoperation capabilities, complete with live camera feedback for precise control. Furthermore, users can conveniently map the area directly from the app using ROS packages and an intel D455 depth camera. The user can then define optimal path for the robot's operation. With autonomous navigation featuring obstacle avoidance, the robot seamlessly executes its tasks, ensuring efficient snow removal operations.

For those interested in delving deeper into the technical aspects, the ROS code repository can be accessed here: [IoT Snow Removal ROS Code](https://github.com/Maaz-Sidd/IoT-snow-Removal-ROS). 

# App demo
<div align="center">
  <video src="https://github.com/Maaz-Sidd/IoT-snow-Removal-App/assets/80440793/bf6acf9e-f7b1-4847-ac35-0b4f4cf21437" width="400" />
<div/>
