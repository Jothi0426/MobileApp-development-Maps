// // //destination marker working code 21/07/2025 -> bash code for internal build
// import axios from 'axios';
// import * as Device from 'expo-device';
// import * as Location from 'expo-location';
// import * as Notifications from 'expo-notifications';
// import { useEffect, useRef, useState } from 'react';
// import {
//   Alert,
//   Button,
//   Dimensions,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import MapViewDirections from 'react-native-maps-directions';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { io } from 'socket.io-client';
 
 
// const SOCKET_URL = 'https://backendcode-m7i1.onrender.com';
// const GOOGLE_MAPS_APIKEY = 'AIzaSyCVCGTYLi3hyqWA81GfvMhTzBrsR1lv6FI';
// const socket = io(SOCKET_URL);
 
// const DriverApp = () => {
//   const [driverLocation, setDriverLocation] = useState(null);
//   const [userLocation, setUserLocation] = useState(null);
//   const [otp, setOtp] = useState('');
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [tracking, setTracking] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [userDestination, setUserDestination] = useState(null);
//   const [showDestinationRoute, setShowDestinationRoute] = useState(false);
 
//   const mapRef = useRef(null);
//   const hasZoomed = useRef(false);
//   const hasGeneratedOtp = useRef(false);
 
//   const driver_id = 1;
 
//   const startTracking = async () => {
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Location permission denied');
//       return;
//     }
 
//     setTracking(true);
//     setShowDestinationRoute(true); // ✅ Show destination marker and route now
 
//     Location.watchPositionAsync(
//       {
//         accuracy: Location.Accuracy.High,
//         timeInterval: 1000,
//         distanceInterval: 0,
//       },
//       (location) => {
//         const { latitude, longitude } = location.coords;
//         const newLocation = { latitude, longitude };
//         setDriverLocation(newLocation);
 
//         if (mapRef.current && !hasZoomed.current) {
//           mapRef.current.animateToRegion(
//             {
//               ...newLocation,
//               latitudeDelta: 0.005,
//               longitudeDelta: 0.005,
//             },
//             1000
//           );
//           hasZoomed.current = true;
//         }
 
//         socket.emit('update-driver-location', {
//           driver_id,
//           latitude,
//           longitude,
//           status: 'available',
//         });
//       }
//     );
//   };
 
//   const verifyOtp = async () => {
//     try {
//       const response = await axios.post(`${SOCKET_URL}/verify-otp`, {
//         driver_id,
//         user_id: userId,
//         otp,
//       });
 
//       if (response.data.success) {
//         Alert.alert('✅ OTP Verified', 'Ride can now start.');
//         setOtpVerified(true);
//       } else {
//         Alert.alert('❌ Invalid OTP', 'Please try again.');
//       }
//     } catch (err) {
//       Alert.alert('❌ Error', 'Failed to verify OTP.');
//     }
//   };
 
//   const showNotification = async (latitude, longitude, user_id) => {
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: 'New Ride Request',
//         body: 'Do you want to accept this ride?',
//         data: { latitude, longitude, user_id },
//         categoryIdentifier: 'ride_request',
//       },
//       trigger: null,
//     });
//   };
 
//   useEffect(() => {
//     const initialize = async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Location permission denied');
//         return;
//       }
 
//       try {
//         const location = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.High,
//         });
 
//         const { latitude, longitude } = location.coords;
//         setDriverLocation({ latitude, longitude });
//       } catch (err) {
//         Alert.alert('Location Error', err.message);
//       }
//     };
 
//     const configureNotifications = async () => {
//       if (Device.isDevice) {
//         const { status: existingStatus } = await Notifications.getPermissionsAsync();
//         let finalStatus = existingStatus;
//         if (finalStatus !== 'granted') {
//           const { status } = await Notifications.requestPermissionsAsync();
//           finalStatus = status;
//         }
 
//         if (finalStatus !== 'granted') {
//           alert('Notification permission not granted');
//         }
 
//         await Notifications.setNotificationCategoryAsync('ride_request', [
//           {
//             identifier: 'ACCEPT',
//             buttonTitle: 'Yes',
//             options: { opensAppToForeground: true },
//           },
//           {
//             identifier: 'DECLINE',
//             buttonTitle: 'No',
//             options: { isDestructive: true },
//           },
//         ]);
 
//         Notifications.setNotificationHandler({
//           handleNotification: async () => ({
//             shouldShowAlert: true,
//             shouldPlaySound: true,
//             shouldSetBadge: false,
//           }),
//         });
 
//         Notifications.addNotificationResponseReceivedListener((response) => {
//           const action = response.actionIdentifier;
//           const { latitude, longitude, user_id } = response.notification.request.content.data;
 
//           setUserId(user_id);
 
//           if (action === 'ACCEPT') {
//             setUserLocation({ latitude, longitude });
 
//             if (!hasGeneratedOtp.current) {
//               const generatedOtp = Math.floor(1000 + Math.random() * 9000);
//               socket.emit('ride-accepted', {
//                 driver_id,
//                 user_id,
//                 driver_latitude: driverLocation?.latitude || 0,
//                 driver_longitude: driverLocation?.longitude || 0,
//                 otp: generatedOtp,
//               });
//               hasGeneratedOtp.current = true;
//             }
//           }
//         });
//       } else {
//         alert('Must use a physical device');
//       }
//     };
 
//     initialize();
//     configureNotifications();
 
//     socket.on('ride-request', (data) => {
//       setUserId(data.user_id);
//       showNotification(data.user_latitude, data.user_longitude, data.user_id);
//       hasGeneratedOtp.current = false;
//     });
 
//     socket.on('destination-for-driver', (data) => {
//       if (data.latitude && data.longitude) {
//         setUserDestination({
//           latitude: data.latitude,
//           longitude: data.longitude,
//           name: data.destination,
//         });
//       }
//     });
 
//     return () => {
//       socket.off('ride-request');
//       socket.off('destination-for-driver');
//     };
//   }, [driverLocation]);
 
//   return (
//     <View style={styles.container}>
//       {driverLocation && (
//         <MapView
//           ref={mapRef}
//           provider={PROVIDER_GOOGLE}
//           style={styles.map}
//           initialRegion={{
//             ...driverLocation,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//         >
//         {/* {driverLocation && (
//           <Marker coordinate={driverLocation} title="Driver" pinColor="green" />
//         )} */}
 
 
//       {driverLocation && (
//         <Marker coordinate={driverLocation} title='Driver' >
//          <View style={styles.carMarker}>
//             <Icon name="taxi" size={13} color="black" />
//          </View>
//        </Marker>
//        )}
//         {userLocation && <Marker coordinate={userLocation} title="User" pinColor="blue" />}
//         {userLocation && driverLocation && (
//           <MapViewDirections
//             origin={driverLocation}
//             destination={userLocation}
//             apikey={GOOGLE_MAPS_APIKEY}
//             strokeWidth={4}
//             strokeColor="blue"
//           />
//         )}
//         {userDestination && (
//           <Marker coordinate={userDestination} title="Destination" pinColor="orange" />
//         )}
//         {userDestination && driverLocation && showDestinationRoute && (
//           <MapViewDirections
//             origin={driverLocation}
//             destination={userDestination}
//             apikey={GOOGLE_MAPS_APIKEY}
//             strokeWidth={4}
//             strokeColor="red"
//           />
//         )}
//       </MapView>
//       )}
//       {!otpVerified && userLocation && (
//         <View style={styles.otpContainer}>
//           <Text style={styles.otpLabel}>Enter OTP from User:</Text>
//           <TextInput
//             style={styles.otpInput}
//             placeholder="Enter OTP"
//             keyboardType="number-pad"
//             value={otp}
//             onChangeText={setOtp}
//           />
//           <Button title="Verify OTP" onPress={verifyOtp} color="#007bff" />
//         </View>
//       )}
 
//       <View style={styles.buttonContainer}>
//         <Button
//           title={tracking ? 'Tracking Started' : 'Start Ride'}
//           onPress={startTracking}
//           disabled={tracking || !otpVerified}
//           color="#28a745"
//         />
//       </View>
//         {otpVerified && (
//       <View style={styles.completeButton}>
//         <Button
//           title="Complete Ride"
//           onPress={() => {
//             socket.emit('ride-completed', { user_id: userId }); // ✅ emit event
//             // 🔴 New line: emit trigger-payment event
//             socket.emit('trigger-payment', { user_id: userId });
//             Alert.alert('Ride Completed');
//           }}
//           color="#dc3545"
//         />
//       </View>
//       )}
//     </View>
//   );
// };
 
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//     map: {
//     width: Dimensions.get('window').width,
//     height: Dimensions.get('window').height - 200,
//   },
// buttonContainer: {
//     position: 'absolute',
//     bottom: 25,
//     alignSelf: 'center',
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 10,
//     elevation: 5,
//   },
//   completeButton: {
//   alignSelf: 'center',
//   backgroundColor: '#E53935',
//   padding: 14,
//   borderRadius: 5,
//   width: 200,
 
// },
  // otpContainer: {
  //   position: 'absolute',
  //   bottom: 100,
  //   left: 20,
  //   right: 20,
  //   backgroundColor: '#ffffff',
  //   padding: 15,
  //   borderRadius: 10,
  //   elevation: 4,
  // },
  // otpInput: {
  //   height: 40,
  //   borderColor: '#ccc',
  //   borderWidth: 1,
  //   marginTop: 10,
  //   marginBottom: 10,
  //   paddingHorizontal: 10,
  //   borderRadius: 5,
  // },
  // otpLabel: {
  //   fontSize: 16,
  //   fontWeight: 'bold',
  // },
 
 
//   carMarker: {
//   backgroundColor: 'yellow',
//   padding: 10,
//   borderRadius: 25,
//   alignItems: 'center',
//   justifyContent: 'center',
// },
 
// });
 
// export default DriverApp;

//////////======== components splitting -> july 29 
// import * as Location from 'expo-location';
// import { useEffect, useRef, useState } from 'react';
// import { Alert, Dimensions, StyleSheet, View } from 'react-native';
// import MapView from 'react-native-maps';

// import { DRIVER_ID, SOCKET_URL } from '../../constants/config';
// import { resetDriverState } from '../../hooks/useDriverState';
// import { useDriverTracking } from '../../hooks/useDriverTracking';
// import { setupNotifications, showNotification } from '../../utils/notificationSetup';
// import { setupSocketListeners, socket } from '../../utils/socketSetup';


// import MapComponent from '../../components/MapComponent';
// import OTPVerification from '../../components/OTPVerification';
// import RideButtons from '../../components/RideButtons';

// const DriverApp = () => {
//   const [driverLocation, setDriverLocation] = useState(null);
//   const [userLocation, setUserLocation] = useState(null);
//   const [otp, setOtp] = useState('');
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [tracking, setTracking] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [userDestination, setUserDestination] = useState(null);
//   const [showDestinationRoute, setShowDestinationRoute] = useState(false);

//   const mapRef = useRef(null);
//   const hasZoomed = useRef(false);
//   const hasGeneratedOtp = useRef(false);
  
//   // Location tracking effect
//   useDriverTracking(setDriverLocation, tracking, setTracking, mapRef, hasZoomed);

//   const startTracking = () => {
//     setTracking(true);
//     setShowDestinationRoute(true); // ✅ Show destination marker and route now
//   };

//   const verifyOtp = async () => {
//     try {
//       const response = await fetch(`${SOCKET_URL}/verify-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           driver_id: DRIVER_ID,
//           user_id: userId,
//           otp,
//         }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         Alert.alert('✅ OTP Verified', 'Ride can now start.');
//         setOtpVerified(true);
//       } else {
//         Alert.alert('❌ Invalid OTP', 'Please try again.');
//       }
//     } catch (err) {
//       Alert.alert('❌ Error', 'Failed to verify OTP.');
//     }
//   };

//   useEffect(() => {
//     const init = async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Location permission denied');
//         return;
//       }

//       try {
//         const location = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.High,
//         });

//         const { latitude, longitude } = location.coords;
//         setDriverLocation({ latitude, longitude });
//       } catch (err) {
//         Alert.alert('Location Error', err.message);
//       }
//     };

//     const handleAccept = ({ latitude, longitude, user_id }) => {
//       setUserId(user_id);
//       setUserLocation({ latitude, longitude });

//       if (!hasGeneratedOtp.current) {
//         const generatedOtp = Math.floor(1000 + Math.random() * 9000);
//         socket.emit('ride-accepted', {
//           driver_id: DRIVER_ID,
//           user_id,
//           driver_latitude: driverLocation?.latitude || 0,
//           driver_longitude: driverLocation?.longitude || 0,
//           otp: generatedOtp,
//         });
//         hasGeneratedOtp.current = true;
//       }
//     };

//     init();
//     setupNotifications(handleAccept);
//     // setupSocketListeners(
//     //   socket,
//     //   setUserId,
//     //   showNotification,
//     //   setUserDestination,
//     //   hasGeneratedOtp,
//     //   driverLocation
//     // );

//     // return () => {
//     //   socket.off('ride-request');
//     //   socket.off('destination-for-driver');
//     //   socket.off('payment-successful');
//     // };
//     setupSocketListeners(
//   socket,
//   setUserId,
//   showNotification,
//   setUserDestination,
//   hasGeneratedOtp,
//   driverLocation
// );

// // Listen for payment success or cancel
// socket.on('payment-successful', () => {
//   Alert.alert('✅ Payment Received', 'Ride payment was successful.');
//   resetDriverState({
//     setOtpVerified,
//     setTracking,
//     setDriverLocation,
//     setUserLocation,
//     setUserDestination,
//   });
//   hasGeneratedOtp.current = false;
// });

// socket.on('payment-cancelled', () => {
//   Alert.alert('❌ Payment Cancelled', 'User cancelled the payment.');
//   resetDriverState({
//     setOtpVerified,
//     setTracking,
//     setDriverLocation,
//     setUserLocation,
//     setUserDestination,
//   });
//   hasGeneratedOtp.current = false;
// });

// return () => {
//   socket.off('ride-request');
//   socket.off('destination-for-driver');
//   socket.off('payment-successful');
//   socket.off('payment-cancelled');
// };

//   }, [driverLocation]);

//   return (
//     <View style={styles.container}>
//       {driverLocation && (
//         <MapView
//           ref={mapRef}
//           provider="google"
//           style={styles.map}
//           initialRegion={{
//             ...driverLocation,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//         >
//           <MapComponent
//             mapRef={mapRef}
//             driverLocation={driverLocation}
//             userLocation={userLocation}
//             userDestination={userDestination}
//             showDestinationRoute={showDestinationRoute}
//           />
//         </MapView>
//       )}

//       {!otpVerified && userLocation && (
//         <OTPVerification otp={otp} setOtp={setOtp} verifyOtp={verifyOtp} />
//       )}

//       <RideButtons
//         tracking={tracking}
//         otpVerified={otpVerified}
//         startTracking={startTracking}
//         userId={userId}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     width: Dimensions.get('window').width,
//     height: Dimensions.get('window').height - 200,
//   },
// });

// export default DriverApp;

/////////////////////////////=======================
// import axios from 'axios';
// import * as Device from 'expo-device';
// import * as Location from 'expo-location';
// import * as Notifications from 'expo-notifications';
// import { useEffect, useRef, useState } from 'react';
// import {
//   Alert,
//   Button,
//   Dimensions,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import MapViewDirections from 'react-native-maps-directions';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { io } from 'socket.io-client';
 
 
// const SOCKET_URL = 'https://backendcode-m7i1.onrender.com';
// const GOOGLE_MAPS_APIKEY = 'AIzaSyCVCGTYLi3hyqWA81GfvMhTzBrsR1lv6FI';
// const socket = io(SOCKET_URL);
 
// const DriverApp = () => {
//   const [driverLocation, setDriverLocation] = useState(null);
//   const [userLocation, setUserLocation] = useState(null);
//   const [otp, setOtp] = useState('');
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [tracking, setTracking] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [userDestination, setUserDestination] = useState(null);
//   const [showDestinationRoute, setShowDestinationRoute] = useState(false);
 
//   const mapRef = useRef(null);
//   const hasZoomed = useRef(false);
//   const hasGeneratedOtp = useRef(false);
 
//   const driver_id = 1;
 
//   const startTracking = async () => {
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Location permission denied');
//       return;
//     }
 
//     setTracking(true);
//     setShowDestinationRoute(true); // ✅ Show destination marker and route now
 
//     Location.watchPositionAsync(
//       {
//         accuracy: Location.Accuracy.High,
//         timeInterval: 1000,
//         distanceInterval: 0,
//       },
//       (location) => {
//         const { latitude, longitude } = location.coords;
//         const newLocation = { latitude, longitude };
//         setDriverLocation(newLocation);
 
//         if (mapRef.current && !hasZoomed.current) {
//           mapRef.current.animateToRegion(
//             {
//               ...newLocation,
//               latitudeDelta: 0.005,
//               longitudeDelta: 0.005,
//             },
//             1000
//           );
//           hasZoomed.current = true;
//         }
 
//         socket.emit('update-driver-location', {
//           driver_id,
//           latitude,
//           longitude,
//           status: 'available',
//         });
//       }
//     );
//   };
 
//   const verifyOtp = async () => {
//     try {
//       const response = await axios.post(`${SOCKET_URL}/verify-otp`, {
//         driver_id,
//         user_id: userId,
//         otp,
//       });
 
//       if (response.data.success) {
//         Alert.alert('✅ OTP Verified', 'Ride can now start.');
//         setOtpVerified(true);
//       } else {
//         Alert.alert('❌ Invalid OTP', 'Please try again.');
//       }
//     } catch (err) {
//       Alert.alert('❌ Error', 'Failed to verify OTP.');
//     }
//   };
 
//   const showNotification = async (latitude, longitude, user_id) => {
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: 'New Ride Request',
//         body: 'Do you want to accept this ride?',
//         data: { latitude, longitude, user_id },
//         categoryIdentifier: 'ride_request',
//       },
//       trigger: null,
//     });
//   };
 
//   //complete ride function
//     const completeRide = () => {
//     setUserLocation(null);
//     setUserDestination(null);
//     setOtp('');
//     setOtpVerified(false);
//     setShowDestinationRoute(false);
//     setTracking(false);
//     setUserId(null);
//     hasZoomed.current = false;
//     hasGeneratedOtp.current = false;

//     // Optional: notify server
//     socket.emit('ride-completed', { driver_id, user_id: userId });

//     Alert.alert('✅ Ride Completed', 'Ready for next ride.');
//   };
//   useEffect(() => {
//     const initialize = async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Location permission denied');
//         return;
//       }
 
//       try {
//         const location = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.High,
//         });
 
//         const { latitude, longitude } = location.coords;
//         setDriverLocation({ latitude, longitude });
//       } catch (err) {
//         Alert.alert('Location Error', err.message);
//       }
//     };
 
//     const configureNotifications = async () => {
//       if (Device.isDevice) {
//         const { status: existingStatus } = await Notifications.getPermissionsAsync();
//         let finalStatus = existingStatus;
//         if (finalStatus !== 'granted') {
//           const { status } = await Notifications.requestPermissionsAsync();
//           finalStatus = status;
//         }
 
//         if (finalStatus !== 'granted') {
//           alert('Notification permission not granted');
//         }
 
//         await Notifications.setNotificationCategoryAsync('ride_request', [
//           {
//             identifier: 'ACCEPT',
//             buttonTitle: 'Yes',
//             options: { opensAppToForeground: true },
//           },
//           {
//             identifier: 'DECLINE',
//             buttonTitle: 'No',
//             options: { isDestructive: true },
//           },
//         ]);
 
//         Notifications.setNotificationHandler({
//           handleNotification: async () => ({
//             shouldShowAlert: true,
//             shouldPlaySound: true,
//             shouldSetBadge: false,
//           }),
//         });
 
//         Notifications.addNotificationResponseReceivedListener((response) => {
//           const action = response.actionIdentifier;
//           const { latitude, longitude, user_id } = response.notification.request.content.data;
 
//           setUserId(user_id);
 
//           if (action === 'ACCEPT') {
//             setUserLocation({ latitude, longitude });
 
//             if (!hasGeneratedOtp.current) {
//               const generatedOtp = Math.floor(1000 + Math.random() * 9000);
//               socket.emit('ride-accepted', {
//                 driver_id,
//                 user_id,
//                 driver_latitude: driverLocation?.latitude || 0,
//                 driver_longitude: driverLocation?.longitude || 0,
//                 otp: generatedOtp,
//               });
//               hasGeneratedOtp.current = true;
//             }
//           }
//         });
//       } else {
//         alert('Must use a physical device');
//       }
//     };
 
//     initialize();
//     configureNotifications();
 
//     socket.on('ride-request', (data) => {
//       setUserId(data.user_id);
//       showNotification(data.user_latitude, data.user_longitude, data.user_id);
//       hasGeneratedOtp.current = false;
//     });
 
//     socket.on('destination-for-driver', (data) => {
//       if (data.latitude && data.longitude) {
//         setUserDestination({
//           latitude: data.latitude,
//           longitude: data.longitude,
//           name: data.destination,
//         });
//       }
//     });
//     //for payment successful
//     socket.on('payment-successful', () => {
//     Alert.alert('Payment Received', 'User has completed the payment successfully.');
//   });
//     return () => {
//       socket.off('ride-request');
//       socket.off('destination-for-driver');
//       socket.off('payment-successful');
//     };
//   }, [driverLocation]);
 
//   return (
//     <View style={styles.container}>
//       {driverLocation && (
//         <MapView
//           ref={mapRef}
//           provider={PROVIDER_GOOGLE}
//           style={styles.map}
//           initialRegion={{
//             ...driverLocation,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//         >
//         {/* {driverLocation && (
//           <Marker coordinate={driverLocation} title="Driver" pinColor="green" />
//         )} */}
 
 
//       {driverLocation && (
//         <Marker coordinate={driverLocation} title='Driver' >
//          <View style={styles.carMarker}>
//             <Icon name="taxi" size={13} color="black" />
//          </View>
//        </Marker>
//        )}
//         {userLocation && <Marker coordinate={userLocation} title="User" pinColor="blue" />}
//         {userLocation && driverLocation && (
//           <MapViewDirections
//             origin={driverLocation}
//             destination={userLocation}
//             apikey={GOOGLE_MAPS_APIKEY}
//             strokeWidth={4}
//             strokeColor="blue"
//           />
//         )}
//         {userDestination && (
//           <Marker coordinate={userDestination} title="Destination" pinColor="orange" />
//         )}
//         {userDestination && driverLocation && showDestinationRoute && (
//           <MapViewDirections
//             origin={driverLocation}
//             destination={userDestination}
//             apikey={GOOGLE_MAPS_APIKEY}
//             strokeWidth={4}
//             strokeColor="red"
//           />
//         )}
//       </MapView>
//       )}
//       {!otpVerified && userLocation && (
//         <View style={styles.otpContainer}>
//           <Text style={styles.otpLabel}>Enter OTP from User:</Text>
//           <TextInput
//             style={styles.otpInput}
//             placeholder="Enter OTP"
//             keyboardType="number-pad"
//             value={otp}
//             onChangeText={setOtp}
//           />
//           <Button title="Verify OTP" onPress={verifyOtp} color="#007bff" />
//         </View>
//       )}
 
//       <View style={styles.buttonContainer}>
//         <Button
//           title={tracking ? 'Tracking Started' : 'Start Ride'}
//           onPress={startTracking}
//           disabled={tracking || !otpVerified}
//           color="#28a745"
//         />
//       </View>
//         {/* {otpVerified && (
//       <View style={styles.completeButton}>
//         <Button
//           title="Complete Ride"
//           onPress={() => {
//             socket.emit('ride-completed', { user_id: userId }); // ✅ emit event
//             // 🔴 New line: emit trigger-payment event
//             socket.emit('trigger-payment', { user_id: userId });
//             Alert.alert('Ride Completed');
//           }}
//           color="#dc3545"
//         />
//       </View>
//       )} */}
//       {otpVerified && showDestinationRoute && (
//         <View style={[styles.buttonContainer, { bottom: 80 }]}>
//           <Button
//             title="Complete Ride"
//             onPress={completeRide}{...() => {
//             // onPress={() => {
//             socket.emit('ride-completed', { user_id: userId }); // ✅ emit event            
//             socket.emit('trigger-payment', { user_id: userId });
//             Alert.alert('Ride Completed');
//           }}
//           color="#dc3545"
//         />
//         </View>
//       )}
//     </View>
//   );
// };
 
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//     map: {
//     width: Dimensions.get('window').width,
//     height: Dimensions.get('window').height - 200,
//   },
// buttonContainer: {
//     position: 'absolute',
//     bottom: 25,
//     alignSelf: 'center',
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 10,
//     elevation: 5,
//   },
// //   completeButton: {
// //   alignSelf: 'center',
// //   backgroundColor: '#E53935',
// //   padding: 14,
// //   borderRadius: 5,
// //   width: 200,
 
// // },
//   otpContainer: {
//     position: 'absolute',
//     bottom: 100,
//     left: 20,
//     right: 20,
//     backgroundColor: '#ffffff',
//     padding: 15,
//     borderRadius: 10,
//     elevation: 4,
//   },
//   otpInput: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginTop: 10,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
//   otpLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
 
 
//   carMarker: {
//   backgroundColor: 'yellow',
//   padding: 10,
//   borderRadius: 25,
//   alignItems: 'center',
//   justifyContent: 'center',
// },
 
// });
 
// export default DriverApp;

////////// last split up 
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import MapComponent from '../components/MapComponent';
import OTPVerification from '../components/OTPVerification';
import RideButtons from '../components/RideButtons';

import {
  configureNotifications,
  showNotification,
} from '../utils/notificationSetup';
import { socket } from '../utils/socketSetup';

import { DRIVER_ID } from '../constants/config';

const DriverApp = () => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userDestination, setUserDestination] = useState(null);
  const [showDestinationRoute, setShowDestinationRoute] = useState(false);

  const mapRef = useRef(null);
  const hasZoomed = useRef(false);
  const hasGeneratedOtp = useRef(false);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location permission denied');
      return;
    }

    setTracking(true);
    setShowDestinationRoute(true); // Show destination route

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 0,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        const newLocation = { latitude, longitude };
        setDriverLocation(newLocation);

        if (mapRef.current && !hasZoomed.current) {
          mapRef.current.animateToRegion(
            {
              ...newLocation,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            1000
          );
          hasZoomed.current = true;
        }

        socket.emit('update-driver-location', {
          driver_id: DRIVER_ID,
          latitude,
          longitude,
          status: 'available',
        });
      }
    );
  };

  const verifyOtp = async () => {
    try {
      const response = await fetch(`${socket.io.opts.path}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: DRIVER_ID,
          user_id: userId,
          otp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('✅ OTP Verified', 'Ride can now start.');
        setOtpVerified(true);
      } else {
        Alert.alert('❌ Invalid OTP', 'Please try again.');
      }
    } catch (err) {
      Alert.alert('❌ Error', 'Failed to verify OTP.');
    }
  };

  const onRideAccept = ({ latitude, longitude, user_id }) => {
    setUserId(user_id);
    setUserLocation({ latitude, longitude });

    if (!hasGeneratedOtp.current) {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000);
      socket.emit('ride-accepted', {
        driver_id: DRIVER_ID,
        user_id,
        driver_latitude: driverLocation?.latitude || 0,
        driver_longitude: driverLocation?.longitude || 0,
        otp: generatedOtp,
      });
      hasGeneratedOtp.current = true;
    }
  };

  const completeRide = () => {
    setUserLocation(null);
    setUserDestination(null);
    setOtp('');
    setOtpVerified(false);
    setShowDestinationRoute(false);
    setTracking(false);
    hasZoomed.current = false;
    hasGeneratedOtp.current = false;
    setUserId(null);

    socket.emit('ride-completed', { driver_id: DRIVER_ID, user_id: userId });

    Alert.alert('✅ Ride Completed', 'Ready for next ride.');
  };

  useEffect(() => {
    const initialize = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = location.coords;
        setDriverLocation({ latitude, longitude });
      } catch (err) {
        Alert.alert('Location Error', err.message);
      }
    };

    initialize();

    configureNotifications(onRideAccept);

    socket.on('ride-request', (data) => {
      setUserId(data.user_id);
      showNotification(data.user_latitude, data.user_longitude, data.user_id);
      hasGeneratedOtp.current = false;
    });

    socket.on('destination-for-driver', (data) => {
      if (data.latitude && data.longitude) {
        setUserDestination({
          latitude: data.latitude,
          longitude: data.longitude,
          name: data.destination,
        });
      }
    });

    socket.on('payment-successful', () => {
      Alert.alert('Payment Received', 'User has completed the payment successfully.');
    });

    return () => {
      socket.off('ride-request');
      socket.off('destination-for-driver');
      socket.off('payment-successful');
    };
  }, [driverLocation]);

  return (
    <View style={styles.container}>
      {driverLocation && (
        <MapComponent
          mapRef={mapRef}
          driverLocation={driverLocation}
          userLocation={userLocation}
          userDestination={userDestination}
          showDestinationRoute={showDestinationRoute}
        />
      )}

      {!otpVerified && userLocation && (
        <OTPVerification otp={otp} setOtp={setOtp} onVerify={verifyOtp} />
      )}

      <RideButtons
        tracking={tracking}
        otpVerified={otpVerified}
        onStart={startTracking}
        onComplete={() => {
          completeRide();
          socket.emit('trigger-payment', { user_id: userId });
          Alert.alert('Ride Completed');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DriverApp;
