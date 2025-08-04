// import React, { useState } from 'react';
// import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
// import axios from 'axios';

// const BACKEND_URL = 'https://backendcode-m7i1.onrender.com';

// export default function OTPComponent({ driverId }) {
//   const [otp, setOtp] = useState('');
//   const [loading, setLoading] = useState(false);

//   const generateOtp = async () => {
//     try {
//       setLoading(true);
//       setOtp('');

//       const response = await axios.post(`${BACKEND_URL}/generate-otp`, {
//         driver_id: driverId,
//       });

//       setOtp(response.data.otp);
//     } catch (error) {
//       console.error('❌ Error generating OTP:', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Button title="Generate OTP" onPress={generateOtp} color="black" />
//       {loading && <ActivityIndicator size="small" color="#0000ff" />}
//       {otp !== '' && <Text style={styles.otpText}>Your OTP: {otp}</Text>}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { marginTop: 20, alignItems: 'center' },
//   otpText: { fontSize: 18, marginTop: 10, fontWeight: 'bold' },
// });

////=========
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';

const BACKEND_URL = 'http://10.10.20.220:5000'; // Change to your actual backend URL if needed

export default function OTPComponent({ driverId }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const generateOtp = async () => {
    try {
      setLoading(true);
      setOtp('');

      const response = await axios.post(`${BACKEND_URL}/generate-otp`, {
        driver_id: driverId,
      });

      if (response.data.otp) {
        setOtp(response.data.otp);
        Alert.alert('OTP Generated', `Your OTP is ${response.data.otp}`);
      } else {
        Alert.alert('Error', 'Failed to generate OTP');
      }
    } catch (error) {
      console.error('❌ Error generating OTP:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Generate OTP" 
        onPress={generateOtp} 
        color="black" 
        disabled={loading}
      />

      {loading && <ActivityIndicator size="small" color="#0000ff" style={styles.loader} />}

      {otp !== '' && (
        <View style={styles.otpContainer}>
          <Text style={styles.otpText}>Your OTP: {otp}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    marginTop: 20, 
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center'
  },
  otpContainer: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center'
  },
  otpText: { 
    fontSize: 18, 
    marginVertical: 10, 
    fontWeight: 'bold' 
  },
  loader: {
    marginVertical: 10
  }
});
