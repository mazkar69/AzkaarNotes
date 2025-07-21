const crypto = require('crypto');
const ENC= 'bf3c199c2470cb477d907b1e0917c17b';
const IV = "5183666c72eec9e4";
const ALGO = "aes-256-ctr"

const encrypt = ((text) => 
{
   let cipher = crypto.createCipheriv(ALGO, ENC, IV);
   let encrypted = cipher.update(text, 'utf8', 'base64');
   encrypted += cipher.final('base64');
   return encrypted;
});

const decrypt = ((text) => 
{
   let decipher = crypto.createDecipheriv(ALGO, ENC, IV);
   let decrypted = decipher.update(text, 'base64', 'utf8');
   return (decrypted + decipher.final('utf8'));
});


//Example uses.
// const encrypted_key = encrypt("HelloWorld");
// const decrypted_key = decrypt(encrypted_key);

// console.log(encrypted_key)
// console.log(decrypted_key)

module.exports = {encrypt,decrypt}