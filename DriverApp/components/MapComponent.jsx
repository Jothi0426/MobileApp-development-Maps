///////============= 08/05/25
// components/MapComponent.jsx
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Icon from 'react-native-vector-icons/FontAwesome';

const MapComponent = ({
  mapRef,
  driverLocation,
  userLocation,
  userDestination,
  showDestinationRoute,
  GOOGLE_MAPS_APIKEY,
}) => {
  return (
    <MapView
      ref={mapRef}
      provider="google"
      style={{ flex: 1 }}
      initialRegion={{
        ...driverLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {driverLocation && (
        <Marker coordinate={driverLocation} title="Driver">
          <View style={{ backgroundColor: 'yellow', padding: 10, borderRadius: 25 }}>
            <Icon name="taxi" size={13} color="black" />
          </View>
        </Marker>
      )}

      {userLocation && <Marker coordinate={userLocation} title="User" pinColor="blue" />}
      {userLocation && driverLocation && (
        <MapViewDirections
          origin={driverLocation}
          destination={userLocation}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={4}
          strokeColor="blue"
        />
      )}
      {userDestination && (
        <Marker coordinate={userDestination} title="Destination" pinColor="orange" />
      )}
      {userDestination && driverLocation && showDestinationRoute && (
        <MapViewDirections
          origin={driverLocation}
          destination={userDestination}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={4}
          strokeColor="red"
        />
      )}
    </MapView>
  );
};

export default MapComponent;
