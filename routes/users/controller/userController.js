const bcrypt = require("bcryptjs");
const User = require("../model/User");

module.exports = {
  //v2 callback
  // signup: (body, callback) => {
  //   bcrypt.genSalt(10, function (err, salt) {
  //     if (err) {
  //       return callback(err, null);
  //     } else {
  //       bcrypt.hash(body.password, salt, function (err, hashedPassword) {
  //         if (err) {
  //           return callback(err, null);
  //         } else {
  //           const createdUser = new User({
  //             firstName: body.firstName,
  //             lastName: body.lastName,
  //             email: body.email,
  //             password: hashedPassword,
  //           });

  //           createdUser.save(function (err, userCreatedInfo) {
  //             if (err) {
  //               return callback(err, null);
  //             } else {
  //               return callback(null, userCreatedInfo);
  //             }
  //           });
  //         }
  //       });
  //     }
  //   });
  // },
  // v3 promises
  // signup: (body) => {
  //   return new Promise((resolve, reject) => {
  //     bcrypt
  //       .genSalt(10)
  //       .then((salt) => {
  //         bcrypt
  //           .hash(body.password, salt)
  //           .then((hashedPassword) => {
  //             const createdUser = new User({
  //               firstName: body.firstName,
  //               lastName: body.lastName,
  //               email: body.email,
  //               password: hashedPassword,
  //             });

  //             createdUser
  //               .save()
  //               .then((savedUser) => {
  //                 resolve(savedUser);
  //               })
  //               .catch((error) => {
  //                 reject(error);
  //               });
  //           })
  //           .catch((error) => {
  //             reject(error);
  //           });
  //       })
  //       .catch((error) => {
  //         reject(error);
  //       });
  //   });
  // },
  //v4 async and await
  getAllUsersCallback: (req, res) => {
    User.find({}, function (err, foundAllUsers) {
      if (err) {
        res.status(500).json({ message: "Failed", errorMessage: err.message });
      } else {
        res.status(200).json({
          message: "success",
          users: foundAllUsers,
        });
      }
    });
  },
  getAllUsers: async (req, res) => {
    try {
      const foundAllUsers = await User.find({});

      res.status(200).json({
        message: "success",
        users: foundAllUsers,
      });
    } catch (error) {
      res.status(500).json({
        message: "failure",
        errorMessage: error.message,
      });
    }
  },
  signup: async (req, res) => {
    //destructuring
    const { firstName, lastName, email, password } = req.body;

    try {
      const salted = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salted);

      const createdUser = new User({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: hashedPassword,
      });

      let savedUser = await createdUser.save();

      res.render("sign-up", { error: null, success: true })

      // res.status(200).json({
      //   message: "success",
      //   user: savedUser,
      // });
    } catch (error) {
      res.status(500).json({
        message: "error",
        errorMessage: error.message,
      });
    }
  },
  deleteUserByID: async (req, res) => {
    try {
      let deletedUser = await User.findByIdAndDelete({ _id: req.params.id });

      res.status(200).json({
        message: "successfully deleted",
        deletedUser: deletedUser,
      });
    } catch (error) {
      res.status(500).json({
        message: "error",
        errorMessage: error.message,
      });
    }
  },
  deleteUserByEmail: async (req, res) => {
    try {
      let deletedUser = await User.findOneAndDelete({ email: req.body.email });

      res.status(200).json({
        message: "successfully deleted",
        deletedUser: deletedUser,
      });
    } catch (error) {
      res.status(500).json({
        message: "error",
        errorMessage: error.message,
      });
    }
  },
  updateUserByID: async (req, res) => {
    try {
      let updatedUser = await User.findByIdAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
      );

      res.status(200).json({
        message: "successfully updated",
        updatedUser: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        message: "error",
        errorMessage: error.message,
      });
    }
  },
  updateUserByEmail: async (req, res) => {
    try {
      let updatedUser = await User.findOneAndUpdate(
        { email: req.body.email },
        req.body,
        { new: true }
      );
      res.status(200).json({
        message: "successfully updated",
        updatedUser: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        message: "error",
        errorMessage: error.message,
      });
    }
  },
  login: async (req, res) => {
    try {
      let foundUser = await User.findOne({ email: req.body.email });

      if (!foundUser) {
        res.render("login", {
          error: {
            message: "User does not exists please go signup.",
          }
        });
      } else {
        let isPasswordTrue = await bcrypt.compare(
          req.body.password,
          foundUser.password
        );

        if (isPasswordTrue) {
          req.session.user = {
            _id: foundUser._id,
            email: foundUser.email,
          }

          res.redirect("/users/home")

        } else {
          res.render("login", {
            error: {
              message: "Please check your email and password",
            }
          });
        }
      }
    } catch (error) {
      res.status(500).json({
        message: "error",
        errorMessage: error.message,
      });
    }
  },
};
