import React from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

export default function RideMap({ userLocation, destCoords, routeCoords, driverCoordinates, mapRef }) {
  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      provider={PROVIDER_GOOGLE}
      region={userLocation ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      } : undefined}
      showsUserLocation
    >
      {userLocation && <Marker coordinate={userLocation} title="You" pinColor="orange" />}
      {destCoords && <Marker coordinate={destCoords} title="Destination" />}
      {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />}
      {driverCoordinates && <Marker coordinate={driverCoordinates} title="Driver" pinColor="red" />}
    </MapView>
  );
}
