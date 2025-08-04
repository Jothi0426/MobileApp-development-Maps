///////// code after cleanup 
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Map from '../../components/RideMap';
import { fetchSuggestions, getCoordinates, getRoute } from '../../services/api';
import { decodePolyline } from '../../services/helpers';
import { registerForPushNotificationsAsync, sendPushNotification } from '../../services/notifications';
import { startPayment } from '../../services/payment';
import Geolocation from '@react-native-community/geolocation';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://backendcode-m7i1.onrender.com';
const socket = io(SOCKET_URL);

export default function UserApp() {
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState('');
  const [destCoords, setDestCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [distance, setDistance] = useState(null);
  const [amount, setAmount] = useState(0);
  const [driverCoordinates, setDriverCoordinates] = useState(null);
  const [driverRoute, setDriverRoute] = useState([]);
  const [rideOtp, setRideOtp] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [rideCompleted, setRideCompleted] = useState(false);
  const [rideState, setRideState] = useState('idle'); // idle | searching | inProgress

  const mapRef = useRef(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        socket.emit('store-push-token', { token });
      }
    });

    Geolocation.getCurrentPosition(
      async ({ coords }) => {
        const loc = { latitude: coords.latitude, longitude: coords.longitude };
        setUserLocation(loc);
      },
      (error) => Alert.alert('Location Error', error.message),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 1000 }
    );

    socket.on('driver-location', ({ latitude, longitude }) => {
      setDriverCoordinates({ latitude, longitude });
      setDriverRoute((prev) => [...prev, { latitude, longitude }]);
    });

    socket.on('ride-accepted', ({ driver_latitude, driver_longitude, otp }) => {
      setDriverCoordinates({ latitude: driver_latitude, longitude: driver_longitude });
      setDriverRoute([{ latitude: driver_latitude, longitude: driver_longitude }]);
      setRideOtp(otp);
      Alert.alert('🚕 Ride Accepted', `Your driver has accepted the ride. OTP: ${otp}`);
      sendPushNotification(expoPushToken, `Your driver accepted the ride. OTP: ${otp}`);
      socket.emit('user-route', { route: routeCoords });
      setRideState('inProgress');
    });

    socket.on('ride-completed', () => {
      setRideCompleted(true);
      Alert.alert('✅ Destination Reached', 'Please proceed to payment.');
      setRideState('Completed');
    });

    socket.on('trigger-payment', () => {
      setRideCompleted(true);
      Alert.alert('💳 Payment Enabled', 'Please tap Pay Now to complete the ride.');
    });

    return () => {
      socket.off('driver-location');
      socket.off('ride-accepted');
      socket.off('ride-completed');
      socket.off('trigger-payment');
      socket.off('payment-successful');
    };
  }, [expoPushToken, routeCoords]);

  const handleDestinationSelect = async (desc) => {
    setDestination(desc);
    setDestinationSuggestions([]);
    const dest = await getCoordinates(desc);
    if (!dest) return;
    setDestCoords(dest);

    const routeData = await getRoute(userLocation, dest);
    const leg = routeData.routes[0]?.legs[0];
    if (leg) {
      setDistance(leg.distance.text);
      const fare = Math.ceil(parseFloat(leg.distance.text) * 15);
      setAmount(fare);
      setRouteCoords(decodePolyline(routeData.routes[0].overview_polyline.points));

      socket.emit('user-destination', {
        user_id: 1,
        destination: desc,
        latitude: dest.latitude,
        longitude: dest.longitude,
      });
    }
  };

  const handlePayment = () => {
    startPayment(
      amount,
      () => {
        Alert.alert('✅ Payment Success', 'Thank you for the ride!');
        socket.emit('payment-successful', { user_id: 1, data: amount }); //payment successful notify to the driver 
        // console.log('Payment received from user:', data);
        setDestination('');
        setDestCoords(null);
        setRouteCoords([]);
        setDriverCoordinates(null);
        setDriverRoute([]);
        setRideOtp(null);
        setRideState('idle');
        setRideCompleted(false);
        setAmount(0);
        setDistance(null);        
      },
      () => Alert.alert('❌ Payment Cancelled'),
      () => {
        Alert.alert('❌ Payment Failed', 'Please try again later.');

        socket.emit('payment-cancelled', { user_id: 1, amount });
        //console.log('Payment cacelled by user:', data);
        setDestination('');
        setDestCoords(null);
        setRouteCoords([]);
        setDriverCoordinates(null);
        setDriverRoute([]);
        setRideOtp(null);
        setRideState('idle');
        setRideCompleted(false);
        setAmount(0);
        setDistance(null);  
      },
        );
  };

  const storeUserLocation = () => {
    if (userLocation) {
      socket.emit('update-user-location', userLocation);
      setRideState('searching');
      Alert.alert('📍 Ride Requested', 'Waiting for driver to accept...');
    }
  };

  const getButtonText = () => {
    if (rideState === 'searching') return 'Searching Driver...';
    if (rideState === 'inProgress') return 'Ride In Progress...';
    return 'Book Ride';
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Map
        userLocation={userLocation}
        destCoords={destCoords}
        routeCoords={routeCoords}
        driverCoordinates={driverCoordinates}
        mapRef={mapRef}
      />

      <View style={styles.panel}>
        <TextInput
          style={styles.input}
          placeholder="Enter Drop Location"
          value={destination}
          // onChangeText={async (text) => {
          //   setDestination(text);
          //   const suggestions = await fetchSuggestions(text);
          //   setDestinationSuggestions(suggestions);
          onChangeText={async (text) => {
            setDestination(text);
            if (text.length > 2) {
              const suggestions = await fetchSuggestions(text);
              setDestinationSuggestions(suggestions);
            } 
            else{
                setDestinationSuggestions([]); // Clear suggestions when input is cleared
            }
          }}
        />
        {destinationSuggestions.map((item) => (
          <TouchableOpacity key={item.place_id} onPress={() => handleDestinationSelect(item.description)}>
            <Text style={styles.suggestion}>{item.description}</Text>
          </TouchableOpacity>
        ))}

        {rideOtp && <Text style={styles.otpText}>✅ Ride Accepted: {rideOtp}</Text>}
        <Text style={styles.fare}>Distance: {distance || '--'} | Fare: ₹{amount || '--'}</Text>

        {rideCompleted && (
          <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, (rideOtp || rideState !== 'idle') && { backgroundColor: '#888' }]}
          onPress={storeUserLocation}
          disabled={!!rideOtp || rideState !== 'idle'}
        >
          <Text style={styles.buttonText}>{getButtonText()}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 10, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10, borderRadius: 6 },
  suggestion: { padding: 10, borderBottomColor: '#ccc', borderBottomWidth: 1 },
  otpText: { fontSize: 18, color: 'green', textAlign: 'center', marginTop: 10 },
  fare: { fontSize: 16, textAlign: 'center', marginVertical: 10 },
  payButton: { backgroundColor: '#2ecc71', padding: 12, borderRadius: 8, marginVertical: 10 },
  payButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  button: { backgroundColor: '#000', padding: 14, borderRadius: 8 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});
