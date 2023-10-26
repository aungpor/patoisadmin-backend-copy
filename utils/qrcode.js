
const qr = require("qrcode");

async function generateQrCode(url) {
    try {
        return await qr.toDataURL(url,
            {
                width: 320,
                height: 320,
            },
        )
    } catch (err) {
        console.log("err: ", err);
        return "";
    }

}

module.exports = {
    generateQrCode
}