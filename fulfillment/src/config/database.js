const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI =
	process.env.MONGODB_URI || 'mongodb://localhost:27017/cbricenho';

class DatabaseConnection {
	constructor() {
		this.connection = null;
	}

	async connect() {
		try {
			if (this.connection && mongoose.connection.readyState === 1) {
				console.log('[Database] Already connected to MongoDB');
				return this.connection;
			}

			const options = {
				serverSelectionTimeoutMS: 5000,
				socketTimeoutMS: 45000,
			};

			this.connection = await mongoose.connect(MONGODB_URI, options);

			console.log(`[Database] Connected to MongoDB: ${MONGODB_URI}`);

			mongoose.connection.on('error', (err) => {
				console.error('[Database] MongoDB connection error:', err);
			});

			mongoose.connection.on('disconnected', () => {
				console.warn(
					'[Database] MongoDB disconnected. Attempting to reconnect...',
				);
			});

			mongoose.connection.on('reconnected', () => {
				console.log('[Database] MongoDB reconnected');
			});

			return this.connection;
		} catch (error) {
			console.error('[Database] Failed to connect to MongoDB:', error);
			throw error;
		}
	}

	async disconnect() {
		try {
			if (this.connection) {
				await mongoose.disconnect();
				console.log('[Database] Disconnected from MongoDB');
				this.connection = null;
			}
		} catch (error) {
			console.error('[Database] Error disconnecting from MongoDB:', error);
			throw error;
		}
	}

	getConnection() {
		return this.connection;
	}

	isConnected() {
		return mongoose.connection.readyState === 1;
	}
}

const dbConnection = new DatabaseConnection();

module.exports = dbConnection;
