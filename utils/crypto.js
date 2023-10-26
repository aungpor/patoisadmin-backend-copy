var CryptoJS = require("crypto-js");


const AES_encrypt = (dataDecryptTextStr) => {
    try {
        var ciphertext = CryptoJS.AES.encrypt(dataDecryptTextStr, process.env.REACT_APP_SECRET_KEY).toString();
        console.log("ciphertext: ", ciphertext);
        return ciphertext;
    } catch (err) {
        throw err
    }
}

const AES_decrypt = (dataEncryptedStr) => {
    try {
        var text_ = CryptoJS.AES.decrypt(dataEncryptedStr, process.env.REACT_APP_SECRET_KEY);
        text_ = text_.toString(CryptoJS.enc.Utf8);
        console.log(text_);
        return text_;
    } catch (err) {
        throw err
    }
}

module.exports = {
    AES_encrypt,
    AES_decrypt
}
