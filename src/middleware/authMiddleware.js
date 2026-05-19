const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require('../errors')
const User = require("../models/user");

const authenticationMiddleware = async (req, res, next) => {


  const authHeaders = req.headers.authorization

  if (!authHeaders || !authHeaders.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid')
  }

  const token = authHeaders.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Find the user and exclude password from the payload
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new UnauthenticatedError("User no longer exists"));
    }

    req.user = user;

    next();

  } catch (error) {
    next(new UnauthenticatedError("Not authorized, token failed"));
  }

}

module.exports = authenticationMiddleware;