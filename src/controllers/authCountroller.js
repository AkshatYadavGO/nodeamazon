import generateToken from "../utils/generateToken.js";
import User from "../models/Users.js";

export const register = async (req, res) => {
  try {
 
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email : email });


    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "Customer",
    });


    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "please enter password and email" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "invalid credentials" });
    }
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.log("Error caught:", error);
    console.log("Error message:", error.message);
    console.log("Error stack:", error.stack);
    res.status(500).json({ message: error.message });
  }
};


 //@desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private

export const getMe=async(req,res)=>{
    try {
        const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    })
    } catch (error) {
        res.status(500).json({message: error.message});
    } 
};



// @desc    Logout user / clear token
// @route   POST /api/auth/logout
// @access  Private

export const logout= async(req,res)=>{
    // Since we're using stateless JWT, logout is handled client-side
    // Server can implement token blacklist here if needed
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};