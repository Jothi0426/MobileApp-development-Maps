// import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

// const OTPVerification = ({ otp, setOtp, verifyOtp }) => (
//   <View style={styles.otpContainer}>
//     <Text style={styles.otpLabel}>Enter OTP from User:</Text>
//     <TextInput
//       style={styles.otpInput}
//       placeholder="Enter OTP"
//       keyboardType="number-pad"
//       value={otp}
//       onChangeText={setOtp}
//     />
//     <Button title="Verify OTP" onPress={verifyOtp} color="#007bff" />
//   </View>
// );

// const styles = StyleSheet.create({
//     otpContainer: {
//     position: 'absolute',
//     bottom: 500,
//     left: 20,
//     right: 20,
//     backgroundColor: '#ffffff',
//     padding: 15,
//     borderRadius: 10,
//     elevation: 4,
//   },
//   otpInput: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginTop: 10,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
//   otpLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default OTPVerification;


// import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

// const OTPVerification = ({ otp, setOtp, onVerify }) => (
//   <View style={styles.otpContainer}>
//     <Text style={styles.otpLabel}>Enter OTP from User:</Text>
//     <TextInput
//       style={styles.otpInput}
//       placeholder="Enter OTP"
//       keyboardType="number-pad"
//       value={otp}
//       onChangeText={setOtp}
//     />
//     <Button title="Verify OTP" onPress={onVerify} color="#007bff" />
//   </View>
// );

// const styles = StyleSheet.create({
//   otpContainer: {
//     position: 'absolute',
//     bottom: 500,
//     left: 20,
//     right: 20,
//     backgroundColor: '#ffffff',
//     padding: 15,
//     borderRadius: 10,
//     elevation: 4,
//   },
//   otpInput: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginTop: 10,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
//   otpLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default OTPVerification;

//////========= 08/05/25
// components/OTPVerification.jsx
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

const OTPVerification = ({ otp, setOtp, verifyOtp }) => (
  <View style={styles.otpContainer}>
    <Text style={styles.otpLabel}>Enter OTP from User:</Text>
    <TextInput
      style={styles.otpInput}
      placeholder="Enter OTP"
      keyboardType="number-pad"
      value={otp}
      onChangeText={setOtp}
    />
    <Button title="Verify OTP" onPress={verifyOtp} color="#007bff" />
  </View>
);

const styles = StyleSheet.create({
  otpContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 4,
  },
  otpInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OTPVerification;
