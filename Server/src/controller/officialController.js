import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Official from "../models/officialModel.js";

const createToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

export const signupOfficial = async (req, res) => {
  try {
    const { name, email, password, department, location } = req.body;
    //   console.log(req.body)
    const existing = await Official.findOne({ email });
    if (existing) return res.status(400).json({ message: "Official already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newOfficial = await Official.create({
      name,
      email,
      password: hashedPassword,
      department,
      location,
    });

    const token = createToken(newOfficial._id);
    res
      .cookie("accessToken", token, { httpOnly: true, secure: true })
      .status(201)
      .json({ message: "Signup successful", official: newOfficial });
  } catch (err) {
    res.status(500).json({ message: "Signup error", error: err.message });
  }
};

export const loginOfficial = async (req, res) => {
  try {
    const { email, password } = req.body;
    const official = await Official.findOne({ email });

    if (!official) {
      return res.status(400).json({ message: "official does not exists" });
    }
    const isMatch = await bcrypt.compare(password, official.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }
    const token = createToken(official._id);
    res
      .cookie("accessToken", token, { httpOnly: true, secure: true, sameSite: "strict" })
      .status(200)
      .json({ message: "Login Successful", official, token });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
}