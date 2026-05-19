
const jwt = require("jsonwebtoken");
const User = require('../models/user')
const { BadRequestError, UnauthenticatedError } = require('../errors');
const { StatusCodes } = require('http-status-codes');


// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Validate that all required properties are provided
  if (!name || !email || !password) {
    throw new BadRequestError('Please provide name, email, and password');
  }

  // 2. Check if the email address is already in use
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new BadRequestError('An account with this email already exists');
  }


  const user = await User.create({ name, email, password });

  // 4. Send back the payload identical to the login layout structure
  res.status(StatusCodes.CREATED).json({
    success: true,
    msg: 'Register successful',
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // Defaults to Admin
    }
  });
};


//login 

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('please provide email and password')
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid email or password")
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new UnauthenticatedError("Invalid email or password")
  }

  res.status(StatusCodes.OK).json({
    success: true,
    msg: 'Login successful',
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  })
}

module.exports = { registerUser, loginUser }