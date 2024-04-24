const CryptoJS = require('crypto-js');

const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString();
};

function generateRandomPassword() {
    const numbers = '0123456789';
    const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const specialCharacters = '!@#$%^&*()_+?><:{}[]';

    const getRandomChar = (chars) => chars.charAt(Math.floor(Math.random() * chars.length));

    let password = '';
    password += getRandomChar(numbers);
    password += getRandomChar(upperCaseLetters);
    password += getRandomChar(lowerCaseLetters);
    password += getRandomChar(specialCharacters);

    while (password.length < 8) {
        const allCharacters = numbers + upperCaseLetters + lowerCaseLetters + specialCharacters;
        password += getRandomChar(allCharacters);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        // If generated password does not meet the criteria, recursively call the function until it does.
        return generateRandomPassword();
    }

    return password;
}


module.exports = {
    validateEmail, validatePassword, encryptPassword, generateRandomPassword
};
