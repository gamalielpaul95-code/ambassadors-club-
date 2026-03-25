const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

// Generate unique member ID
const generateMemberId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `AMB-${year}-${random}`;
};

// Register new member
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    
    // Check if member exists
    const existingMember = await Member.findOne({ $or: [{ email }, { phone }] });
    if (existingMember) {
      return res.status(400).json({ 
        message: 'Member already exists with this email or phone',
        success: false 
      });
    }
    
    const memberId = generateMemberId();
    
    const member = new Member({
      fullName,
      email,
      phone,
      password,
      memberId
    });
    
    await member.save();
    
    const token = jwt.sign(
      { id: member._id, role: member.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      member: {
        id: member._id,
        fullName: member.fullName,
        email: member.email,
        memberId: member.memberId,
        role: member.role,
        profilePicture: member.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const member = await Member.findOne({ email });
    if (!member) {
      return res.status(401).json({ message: 'Invalid credentials', success: false });
    }
    
    const isPasswordValid = await member.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials', success: false });
    }
    
    member.lastLogin = new Date();
    await member.save();
    
    const token = jwt.sign(
      { id: member._id, role: member.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      member: {
        id: member._id,
        fullName: member.fullName,
        email: member.email,
        memberId: member.memberId,
        role: member.role,
        profilePicture: member.profilePicture,
        position: member.position,
        church: member.church
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

module.exports = router;
