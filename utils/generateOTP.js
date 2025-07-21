// Utility function to generate a 6-digit OTP
 const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


 export default generateOTP;