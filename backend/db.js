require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Initialize PostgreSQL database connection over SSL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Models for the ERP System
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'STUDENT' }, // 'ADMIN', 'TEACHER', 'STUDENT'
  password: { type: DataTypes.STRING, defaultValue: 'password123' },
  grade: { type: DataTypes.STRING }, 
  guardian: { type: DataTypes.STRING }, 
  subject: { type: DataTypes.STRING },
});

const Attendance = sequelize.define('Attendance', {
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING }, // 'PRESENT', 'ABSENT', 'LATE'
});

const Payment = sequelize.define('Payment', {
  amount: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'PENDING' }, // 'PENDING', 'PAID'
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
});

// Configure Relationships
User.hasMany(Attendance, { foreignKey: 'userId' });
Attendance.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Attendance, Payment };
