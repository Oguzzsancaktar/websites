const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    default: 10,
    validate: (value) => {
      if (value < 0) {
        throw new Error('Age must be positive');
      }
    },
  },
  email: {
    type: String,
    required: true,
    unique:true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Please enter a valid e mail adress');
      }
    },
  },

  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password" keyword');
      }
    },
  },
});

userSchema.statics.findByCredentials = async (email, password) => {
  
  const user = await User.findOne({ email })
  
  if (!user) {
    throw new Error('user not found with that email');
  }

  const isMatch = await bcrypt.compare(password , user.password)
  if (!isMatch) {
   throw new Error('user not found with that email');
  }
  
  return user
}


// hash the plain password before saving
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
