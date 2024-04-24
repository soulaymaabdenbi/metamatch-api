const CryptoJS = require('crypto-js');
const User = require('../models/User');
const smtpFunction = require("../utils/smtp_function");
const helper = require('../utils/helper');
const {loginUser, createUser} = require('../controllers/authController');
const {validatePassword} = require('../utils/helper'); // Import validatePassword and encryptPassword
const {changePassword} = require("../controllers/userController");

process.env.SECRET_KEY = 'metamatch2024';
// Mocks
jest.mock('../models/User');
jest.mock('crypto-js', () => ({
    AES: {
        decrypt: jest.fn().mockImplementation(() => ({toString: jest.fn().mockReturnValue('decryptedPassword')})),
        encrypt: jest.fn().mockImplementation(() => ({toString: jest.fn().mockReturnValue('encryptedPassword')}))
    }
}));
jest.mock('jsonwebtoken', () => ({sign: jest.fn().mockReturnValue('fakeToken')}));
jest.mock('../utils/helper');
jest.mock("../utils/smtp_function");


beforeEach(() => {
    jest.clearAllMocks();
    // Setup default behavior for mocks
    validatePassword.mockReturnValue(true); // Correctly mock validatePassword
    helper.validateEmail.mockReturnValue(true); // Adjust as needed for each test
    helper.encryptPassword.mockReturnValue('encryptedPassword');
    helper.generateRandomPassword.mockReturnValue('randomPassword');
    smtpFunction.sendAccountCredentials.mockResolvedValue(true);
});
describe('authController', () => {
    describe('loginUser', () => {
        it('should return an error for invalid email format', async () => {
            // Override validateEmail for this test
            helper.validateEmail.mockReturnValue(false);

            const req = {body: {email: 'invalidemail', password: 'password123'}};
            const res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

            await loginUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({status: false, message: "Invalid email address"});
        });


    });


    describe('createUser', () => {
        it('should successfully create a new user with a specific role and send account credentials', async () => {
            User.findOne.mockResolvedValue(null); // Simulate user not found
            const mockSave = jest.fn().mockResolvedValue({
                _id: 'unique-id',
                email: 'souleymaabdenbi@gmail.com',
                role: 'Player',
                profile: "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
                // Include other relevant user details
            });
            User.mockImplementation(() => ({save: mockSave}));

            const req = {
                body: {
                    fullname: 'John Doe', username: 'johndoe', email: 'souleymaabdenbi@gmail.com', role: 'Player'
                }
            };
            const res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

            await createUser(req, res);

            expect(User.findOne).toHaveBeenCalledWith({email: 'souleymaabdenbi@gmail.com'});
            expect(mockSave).toHaveBeenCalled(); // Verify that save was called
            // Update the expected arguments to match the actual call in createUser
            expect(smtpFunction.sendAccountCredentials).toHaveBeenCalledWith('souleymaabdenbi@gmail.com', 'johndoe', 'randomPassword');

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: true, message: "User created successfully", user: expect.objectContaining({role: 'Player'})
            }));
        });

    });

});
