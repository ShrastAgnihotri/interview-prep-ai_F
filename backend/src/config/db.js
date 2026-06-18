/**
 * @module config/db
 * @description MongoDB connection configuration with automatic retry logic.
 * Attempts to connect to MongoDB with configurable retry count and delay.
 * Exits the process if all connection attempts fail.
 */

const mongoose = require('mongoose');

/**
 * Connects to MongoDB with retry logic.
 * Uses exponential backoff to handle transient connection failures.
 *
 * @param {number} [retries=5] - Maximum number of connection attempts
 * @param {number} [delay=5000] - Delay between retries in milliseconds
 * @returns {Promise<import('mongoose').Connection>} Mongoose connection instance
 * @throws {Error} If all connection attempts are exhausted
 */
const connectDB = async (retries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📦 Database: ${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);

      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('💀 All MongoDB connection attempts failed. Exiting process...');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
