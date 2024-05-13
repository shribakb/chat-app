const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic, group, gender, dateOfBirth, status } =
    req.body;

  if (!name || !email || !password || !group || !gender || !dateOfBirth) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
    group,
    gender,
    dateOfBirth,
    status,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      // isAdmin: user.isAdmin,
      pic: user.pic,
      group: user.group,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      token: generateToken(user._id),
      status: true,
    });
  } else {
    res.status(400);
    throw new Error("Failed to create User");
  }
});

// const editUser = asyncHandler(async (req, res) => {
//   const userId = req.params.id;
//   const { name, email, password, pic, group, gender, dateOfBirth } = req.body;

//   try {
//     const user = await User.findById(userId);

//     if (!user) {
//       res.status(404);
//       throw new Error("User not found");
//     }

//     if (name) {
//       user.name = name;
//     }
//     if (email) {
//       user.email = email;
//     }
//     if (password) {
//       user.password = password;
//     }
//     if (pic) {
//       user.pic = pic;
//     }
//     if (group) {
//       user.group = group;
//     }
//     if (gender) {
//       user.gender = gender;
//     }
//     if (dateOfBirth) {
//       user.dateOfBirth = dateOfBirth;
//     }

//     const updatedUser = await user.save();

//     res.status(200).json({
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       pic: updatedUser.pic,
//       group: updatedUser.group,
//       gender: updatedUser.gender,
//       dateOfBirth: updatedUser.dateOfBirth,
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });
const editUser = asyncHandler(async (req, res) => {
  const { userId, name, email, group, gender, dateOfBirth } = req.body;

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId }, // Умова пошуку користувача за його ідентифікатором
    {
      $set: {
        name: name,
        email: email,
        group: group,
        gender: gender,
        dateOfBirth: dateOfBirth,
      },
    }, // Об'єкт з новими значеннями для полів, які потрібно змінити
    { new: true } // Опція, щоб повертати оновлений документ
  );

  if (!updatedUser) {
    res.status(404).json({ message: "User not found" });
  } else {
    res.status(200).json(updatedUser);
  }
  // const updatedUser = await User.findByIdAndUpdate(
  //   userId,
  //   {
  //     name: name,
  //     email: email,
  //     password: password,
  //     pic: pic,
  //     group: group,
  //     gender: gender,
  //     dateOfBirth: dateOfBirth,
  //   },
  //   {
  //     new: true,
  //   }
  // );

  // if (!updatedUser) {
  //   res.status(404);
  //   throw new Error("User Not Found");
  // } else {
  //   res.json(updatedUser);
  // }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const result = await User.deleteOne({ _id: userId }); // Видалити користувача за його ідентифікатором
  if (result.deletedCount === 0) {
    res.status(404).json({ message: "User not found" });
  } else {
    res.status(200).json({ message: "User deleted successfully" });
  }
});

const statusUser = asyncHandler(async (req, res) => {
  const { userId, status } = req.body;

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId }, // Умова пошуку користувача за його ідентифікатором
    {
      $set: {
        status: status,
      },
    }, // Об'єкт з новими значеннями для полів, які потрібно змінити
    { new: true } // Опція, щоб повертати оновлений документ
  );

  if (!updatedUser) {
    res.status(404).json({ message: "User status error" });
  } else {
    res.status(200).json(updatedUser);
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      // isAdmin: user.isAdmin,
      pic: user.pic,
      group: user.group,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      token: generateToken(user._id),
      status: true,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword);
  res.send(users);
});

module.exports = {
  registerUser,
  authUser,
  allUsers,
  editUser,
  deleteUser,
  statusUser,
};
