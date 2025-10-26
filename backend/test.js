require("dotenv").config();
const encryptionService = require('./config/encryption')


const data = 'hello'
const encrypted = encryptionService.encrypt(data)
console.log(encrypted)

const decrypted = encryptionService.decrypt(encrypted)
console.log(decrypted)

