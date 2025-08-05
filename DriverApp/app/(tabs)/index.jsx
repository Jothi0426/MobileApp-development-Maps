////==== 05/08/25
// app/DriverApp.jsx
import axios from 'axios';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';

import MapComponent from '../../components/MapComponent';
import OTPVerification from '../../components/OTPVerification';
import RideButtons from '../../components/RideButtons';

import { GOOGLE_MAPS_APIKEY, SOCKET_URL, DRIVER_ID as driver_id } from '../../constants/config';
import { configureNotifications, showNotification } from '../../utils/notificationSetup';
import { socket } from '../../utils/socketSetup';

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
    setShowDestinationRoute(true);

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
          driver_id,
          latitude,
          longitude,
          status: 'available',
        });
      }
    );
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post(`${SOCKET_URL}/verify-otp`, {
        driver_id,
        user_id: userId,
        otp,
      });

      if (response.data.success) {
        Alert.alert('✅ OTP Verified', 'Ride can now start.');
        setOtpVerified(true);
      } else {
        Alert.alert('❌ Invalid OTP', 'Please try again.');
      }
    } catch {
      Alert.alert('❌ Error', 'Failed to verify OTP.');
    }
  };

  const completeRide = () => {
    setUserLocation(null);
    setUserDestination(null);
    setOtp('');
    setOtpVerified(false);
    setShowDestinationRoute(false);
    setTracking(false);
    setUserId(null);
    hasZoomed.current = false;
    hasGeneratedOtp.current = false;

    socket.emit('ride-completed', { driver_id, user_id: userId });
    socket.emit('trigger-payment', { user_id: userId });

    Alert.alert('✅ Ride Completed', 'Ready for next ride.');
  };

  useEffect(() => {
    const initialize = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setDriverLocation({ latitude, longitude });
    };

    const onAcceptRide = ({ latitude, longitude, user_id }) => {
      setUserId(user_id);
      setUserLocation({ latitude, longitude });

      if (!hasGeneratedOtp.current) {
        const generatedOtp = Math.floor(1000 + Math.random() * 9000);
        socket.emit('ride-accepted', {
          driver_id,
          user_id,
          driver_latitude: driverLocation?.latitude || 0,
          driver_longitude: driverLocation?.longitude || 0,
          otp: generatedOtp,
        });
        hasGeneratedOtp.current = true;
      }
    };

    initialize();
    configureNotifications(onAcceptRide);

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
    <View style={{ flex: 1 }}>
      {driverLocation && (
        <MapComponent
          mapRef={mapRef}
          driverLocation={driverLocation}
          userLocation={userLocation}
          userDestination={userDestination}
          showDestinationRoute={showDestinationRoute}
          GOOGLE_MAPS_APIKEY={GOOGLE_MAPS_APIKEY}
        />
      )}

      {!otpVerified && userLocation && (
        <OTPVerification otp={otp} setOtp={setOtp} verifyOtp={verifyOtp} />
      )}

      <RideButtons
        tracking={tracking}
        otpVerified={otpVerified}
        startTracking={startTracking}
        completeRide={completeRide}
        showDestinationRoute={showDestinationRoute}
      />
    </View>
  );
};

export default DriverApp;
