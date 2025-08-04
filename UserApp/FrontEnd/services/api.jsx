import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCVCGTYLi3hyqWA81GfvMhTzBrsR1lv6FI'; 

export const fetchSuggestions = async (input) => {
  if (!input) return [];
  const res = await axios.get(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${GOOGLE_MAPS_API_KEY}&components=country:in`
  );
  return res.data.predictions;
};

export const getCoordinates = async (place) => {
  const res = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${GOOGLE_MAPS_API_KEY}`
  );
  const loc = res.data.results[0]?.geometry?.location;
  return loc ? { latitude: loc.lat, longitude: loc.lng } : null;
};

export const getAddressFromCoords = async (latitude, longitude) => {
  const res = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
  );
  return res.data.results[0]?.formatted_address || null;
};

export const getRoute = async (origin, destination) => {
  const res = await axios.get(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`
  );
  return res.data;
};
