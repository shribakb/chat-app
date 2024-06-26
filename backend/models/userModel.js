const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    group: { type: String, required: true }, // Додане поле групи
    gender: { type: String, required: true }, // Додане поле гендеру
    dateOfBirth: { type: Date, required: true }, // Додане поле дати народження
    status: { type: Boolean, required: true, default: false }, // Додане поле статусу онлайн/офлайн
    // isAdmin: {
    //   type: Boolean,
    //   required: true,
    //   default: false,
    // },
  },
  { timestaps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
