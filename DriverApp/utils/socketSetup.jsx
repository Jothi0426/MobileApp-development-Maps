import { Alert } from 'react-native';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';

export const socket = io(SOCKET_URL);

export const setupSocketListeners = (
  socket,
  setUserId,
  showNotification,
  setUserDestination,
  hasGeneratedOtp,
  driverLocation,
  setOtpVerified,
  setRideStarted,
  setRideCompleted,
  setPickupCoords,
  setDestinationCoords,
  setRouteCoords,
  setCurrentLocation,
  setUserLocation,
  setUserSocketId,
  setDriverLocation,
  setTracking
) => {
  // 1. Ride request notification to driver
  socket.on('ride-request', (data) => {
    setUserId(data.user_id);
    showNotification(data.user_latitude, data.user_longitude, data.user_id);
    hasGeneratedOtp.current = false;
  });

  // 2. Receive destination after OTP verification
  socket.on('destination-for-driver', (data) => {
    if (data.latitude && data.longitude) {
      setUserDestination({
        latitude: data.latitude,
        longitude: data.longitude,
        name: data.destination,
      });
    }
  });

  // 3. Handle payment success from user
  socket.on('payment-successful', () => {
    Alert.alert('💰 Payment Received', 'The user has completed the payment successfully.');

    // Reset driver app state
    setOtpVerified(false);
    setRideStarted(false);
    setRideCompleted(false);
    setPickupCoords(null);
    setDestinationCoords(null);
    setRouteCoords([]);
    setCurrentLocation(null);
    setUserLocation(null);
    setUserSocketId(null);
    setDriverLocation(null);
    setUserDestination(null);
    setTracking(false);
  });

  // 4. Handle payment cancellation by user
  socket.on('payment-cancelled', (data) => {
    Alert.alert('❌ Payment Cancelled', 'The user cancelled the payment.');

    // Reset driver app state
    setOtpVerified(false);
    setRideStarted(false);
    setRideCompleted(false);
    setPickupCoords(null);
    setDestinationCoords(null);
    setRouteCoords([]);
    setCurrentLocation(null);
    setUserLocation(null);
    setUserSocketId(null);
    setDriverLocation(null);
    setUserDestination(null);
    setTracking(false);
  });
};



// import { Alert } from 'react-native';
// import { SOCKET_URL } from '../constants/config';

// export const setupSocketListeners = (
//   socket,
//   setUserId,
//   showNotification,
//   setUserDestination,
//   hasGeneratedOtp,
//   driverStateResetFns
// ) => {
//   const reset = () => resetDriverState(driverStateResetFns);

//   const handleRideRequest = (data) => {
//     setUserId(data.user_id);
//     showNotification(data.user_latitude, data.user_longitude, data.user_id);
//     hasGeneratedOtp.current = false;
//   };

//   const handleDestination = (data) => {
//     if (data.latitude && data.longitude) {
//       setUserDestination({
//         latitude: data.latitude,
//         longitude: data.longitude,
//         name: data.destination,
//       });
//     }
//   };

//   const handlePaymentSuccess = () => {
//     Alert.alert('💰 Payment Received', 'The user has completed the payment successfully.');
//     console.log('Payment successful');
//     reset();
//   };

//   const handlePaymentCancelled = () => {
//     Alert.alert('❌ Payment Cancelled', 'The user cancelled the payment.');
//     console.log('Payment cancelled');
//     reset();
//   };

//   socket.on('ride-request', handleRideRequest);
//   socket.on('destination-for-driver', handleDestination);
//   socket.on('payment-successful', handlePaymentSuccess);
//   socket.on('payment-cancelled', handlePaymentCancelled);

//   return () => {
//     socket.off('ride-request', handleRideRequest);
//     socket.off('destination-for-driver', handleDestination);
//     socket.off('payment-successful', handlePaymentSuccess);
//     socket.off('payment-cancelled', handlePaymentCancelled);
//   };
// };
