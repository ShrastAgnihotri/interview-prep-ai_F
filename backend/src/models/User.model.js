/**
 * @module models/User
 * @description User model for authentication and profile management.
 * Handles password hashing via bcryptjs pre-save hooks and
 * provides a password comparison instance method.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @typedef {Object} UserDocument
 * @property {string} name - User's display name
 * @property {string} email - Unique email address (lowercase)
 * @property {string} password - Hashed password (excluded from queries by default)
 * @property {Date} createdAt - Account creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Exclude password from query results by default
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware to hash password before saving to the database.
 * Only hashes the password if it has been modified (or is new).
 * Uses bcryptjs with a salt factor of 12 for strong security.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compares a candidate password against the stored hashed password.
 *
 * @param {string} candidatePassword - The plaintext password to verify
 * @returns {Promise<boolean>} True if the password matches, false otherwise
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
