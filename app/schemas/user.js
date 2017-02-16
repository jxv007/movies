var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');
const saltRounds = 10;

var UserSchema = new Schema({
  username:{
    type:String,
    unique:true
  },
  password:String,
  role:{
    type:Number,
    default:99
  },
  meta:{
    createAt:{
      type:Date,
      default:Date.now()
    },
    updateAt:{
      type:Date,
      default:Date.now()
    }
  }
});

UserSchema.pre('save',function(next){
  var user = this;
  if(this.isNew){
    this.createAt = this.updateAt = Date.now();
  }else{
    this.updateAt = Date.now();
  }
  bcrypt.genSalt(saltRounds,(err,salt)=>{
    if(err) return next(err);
    bcrypt.hash(user.password,salt,(err,hash)=>{
      if(err) return next(err);
      user.password = hash;
      next();
    })
  })
})

UserSchema.methods = {
  comparePassword:function(_password,cb){
    bcrypt.compare(_password,this.password,(err,isMatched)=>{
      if(err) return cb(err);
      cb(null,isMatched);
    })
  }
}

UserSchema.statics = {
  fetch: function(cb){
    return this
      .find({})
      .sort('meta.updateAt')
      .exec(cb)
  },
  findById: function(id,cb){
    return this
      .findOne({_id:id})
      .exec(cb)
  }
}

module.exports = UserSchema;