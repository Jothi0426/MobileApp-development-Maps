// import { View } from 'react-native';
// import { Marker } from 'react-native-maps';
// import MapViewDirections from 'react-native-maps-directions';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { GOOGLE_MAPS_APIKEY } from '../constants/config';

// const MapComponent = ({ mapRef, driverLocation, userLocation, userDestination, showDestinationRoute }) => (
//   <>
//     {driverLocation && (
//       <Marker coordinate={driverLocation} title='Driver'>
//         <View style={{ backgroundColor: 'yellow', padding: 10, borderRadius: 25 }}>
//           <Icon name="taxi" size={13} color="black" />
//         </View>
//       </Marker>
//     )}

//     {userLocation && <Marker coordinate={userLocation} title="User" pinColor="blue" />}

//     {userLocation && driverLocation && (
//       <MapViewDirections
//         origin={driverLocation}
//         destination={userLocation}
//         apikey={GOOGLE_MAPS_APIKEY}
//         strokeWidth={4}
//         strokeColor="blue"
//       />
//     )}

//     {userDestination && (
//       <Marker coordinate={userDestination} title="Destination" pinColor="orange" />
//     )}

//     {userDestination && driverLocation && showDestinationRoute && (
//       <MapViewDirections
//         origin={driverLocation}
//         destination={userDestination}
//         apikey={GOOGLE_MAPS_APIKEY}
//         strokeWidth={4}
//         strokeColor="red"
//       />
//     )}
//   </>
// );

// export default MapComponent;


import { Dimensions, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Icon from 'react-native-vector-icons/FontAwesome';

const GOOGLE_MAPS_APIKEY = 'AIzaSyCVCGTYLi3hyqWA81GfvMhTzBrsR1lv6FI';

const MapComponent = ({
  mapRef,
  driverLocation,
  userLocation,
  userDestination,
  showDestinationRoute,
}) => {
  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={{
        ...driverLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {driverLocation && (
        <Marker coordinate={driverLocation} title="Driver">
          <Icon name="taxi" size={13} color="black" style={styles.carMarker} />
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

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 200,
  },
  carMarker: {
    backgroundColor: 'yellow',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MapComponent;
