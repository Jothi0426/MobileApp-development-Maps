import RazorpayCheckout from 'react-native-razorpay';

export function startPayment(amount, onSuccess, onCancel) {
  const options = {
    description: 'Ride Payment',
    currency: 'INR',
    key: 'rzp_test_CwnSoRAQisnru4',
    amount: amount * 100,
    name: 'rides',
    prefill: {
      email: 'void@razorpay.com',
      contact: '8668170773',
      name: 'Razorpay Software',
    },
    theme: { color: '#F37254' },
  };

  RazorpayCheckout.open(options)
    .then((data) => onSuccess(data))
    .catch((data) => onCancel(data));
}
