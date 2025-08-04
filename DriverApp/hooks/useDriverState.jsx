export const resetDriverState = ({
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
  setUserDestination,
  setTracking
}) => {
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
};
