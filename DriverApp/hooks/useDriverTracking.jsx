import * as Location from 'expo-location';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { DRIVER_ID } from '../constants/config';
import { socket } from '../utils/socketSetup';

export const useDriverTracking = (setDriverLocation, tracking, setTracking, mapRef, hasZoomed) => {
  useEffect(() => {
    if (!tracking) return;

    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied');
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 0,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          const newLoc = { latitude, longitude };
          setDriverLocation(newLoc);

          if (mapRef.current && !hasZoomed.current) {
            mapRef.current.animateToRegion(
              { ...newLoc, latitudeDelta: 0.005, longitudeDelta: 0.005 },
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

    startWatching();
  }, [tracking]);
};
