var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt-nodejs');

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: false
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  permission: {
    type: String,
    required: true,
    default: 'user'
  }
});

UserSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password'))
    return next();

  bcrypt.hash(user.password, null, null, (err, hash) => {
    if (err) return next(err)
    user.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function(password){
  return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('User', UserSchema);
