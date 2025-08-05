// import { Button, StyleSheet, View } from 'react-native';
// import { socket } from '../utils/socketSetup';

// const RideButtons = ({ tracking, otpVerified, startTracking, userId }) => (
//   <>
//     <View style={styles.buttonContainer}>
//       <Button
//         title={tracking ? 'Tracking Started' : 'Start Ride'}
//         onPress={startTracking}
//         disabled={tracking || !otpVerified}
//         color="#28a745"
//       />
//     </View>

//     {otpVerified && (
//       <View style={styles.completeButton}>
//         <Button
//           title="Complete Ride"
//           onPress={() => {
//             socket.emit('ride-completed', { user_id: userId });
//             socket.emit('trigger-payment', { user_id: userId });
//             alert('Ride Completed');
//           }}
//           color="#dc3545"
//         />
//       </View>
//     )}
//   </>
// );

// const styles = StyleSheet.create({
//   buttonContainer: {
//     position: 'absolute',
//     bottom: 3,
//     alignSelf: 'center',
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 10,
//     elevation: 5,
//     width: 200,
//   },
//   completeButton: {
//     alignSelf: 'center',
//     backgroundColor: '#E53935',
//     padding: 10,
//     borderRadius: 10,
//     width: 200,
//     bottom: -4,
//   },
// });

// export default RideButtons;
////////////////======================
// import { Alert, Button, StyleSheet, View } from 'react-native';
// import { socket } from '../utils/socketSetup';


// const RideButtons = ({
//   tracking,
//   otpVerified,
//   startTracking,
//   userId,
//   setTracking,
//   setOtpVerified,
//   setDriverLocation,
//   setUserLocation,
//   setUserDestination,
//   hasGeneratedOtp,
// }) => {
//   const handleCompleteRide = () => {
//     socket.emit('ride-completed', { user_id: userId });
//     socket.emit('trigger-payment', { user_id: userId });

//     Alert.alert('✅ Ride Completed', 'Payment process will begin.');

//     // Reset driver app state to normal
//     // startTracking(false);
//     // setOtpVerified(false);
//     // setDriverLocation(null);
//     // setUserLocation(null);
//     // resetDestination && resetDestination();     // optional if you handle destination
//     // resetRideState && resetRideState();         // optional global ride reset
//     // setUserDestination(null);
//     // hasGeneratedOtp.current = false;
//     setTracking?.(false);
//     setOtpVerified?.(false);
//     setDriverLocation?.(null);
//     setUserLocation?.(null);
//     setUserDestination?.(null);
//     if (hasGeneratedOtp?.current !== undefined) hasGeneratedOtp.current = false;

//   };

//   return (
//     <>
//       <View style={styles.buttonContainer}>
//         <Button
//           title={tracking ? 'Tracking Started' : 'Start Ride'}
//           onPress={startTracking}
//           disabled={tracking || !otpVerified}
//           color="#28a745"
//         />
//       </View>

//       {otpVerified && (
//         <View style={styles.completeButton}>
//           <Button
//             title="Complete Ride"
//             onPress={handleCompleteRide}
//             color="#dc3545"
//           />
//         </View>
//       )}
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   buttonContainer: {
//     position: 'absolute',
//     bottom: 3,
//     alignSelf: 'center',
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 10,
//     elevation: 5,
//     width: 200,
//   },
//   completeButton: {
//     alignSelf: 'center',
//     backgroundColor: '#E53935',
//     padding: 10,
//     borderRadius: 10,
//     width: 200,
//     bottom: -4,
//   },
// });

// export default RideButtons;

////////////================ 08/05/25
// components/RideButtons.jsx
import { Button, StyleSheet, View } from 'react-native';

const RideButtons = ({
  tracking,
  otpVerified,
  startTracking,
  completeRide,
  showDestinationRoute,
}) => (
  <>
    <View style={styles.buttonContainer}>
      <Button
        title={tracking ? 'Tracking Started' : 'Start Ride'}
        onPress={startTracking}
        disabled={tracking || !otpVerified}
        color="#28a745"
      />
    </View>

    {otpVerified && showDestinationRoute && (
      <View style={[styles.buttonContainer, { bottom: 80 }]}>
        <Button
          title="Complete Ride"
          onPress={completeRide}
          color="#dc3545"
        />
      </View>
    )}
  </>
);

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
});

export default RideButtons;

