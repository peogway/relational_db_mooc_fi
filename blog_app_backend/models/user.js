const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../utils/db')

class User extends Model {}

User.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		username: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			validate: {
				isEmail: {
					msg: 'username must be a valid email address',
				},
			},
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		password_hash: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		sequelize,
		underscored: true,
		timestamps: true,
		modelName: 'user',
	},
)

module.exports = User

