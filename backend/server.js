const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

dotenv.config();
connectDB();
const app = express();

app.use(express.json()); // to accept json data

const mysql = require("mysql");

// const connection = mysql.createConnection({
//   host: "localhost", // Адреса вашого сервера MySQL
//   user: "root", // Ім'я користувача MySQL
//   password: "", // Пароль користувача MySQL
//   database: "pi_db", // Назва бази даних MySQL
// });

// connection.connect((err) => {
//   if (err) {
//     console.error("Помилка підключення до бази даних:", err);
//     return;
//   }
//   console.log("Підключено до бази даних MySQL");
// });

// connection.query("SELECT * FROM pi_db", (err, results, fields) => {
//   if (err) throw err;
//   console.log("Результати запиту:", results);
// });

// app.get("/api/data", (req, res) => {
//   connection.query("SELECT * FROM pi_db", (error, results, fields) => {
//     if (error) {
//       console.error("Помилка запиту до бази даних:", error);
//       res.status(500).json({ error: "Помилка запиту до бази даних" });
//     } else {
//       // Відправлення результатів на клієнтську сторону
//       res.json(results);
//     }
//   });
// });

// app.post("/api/addData", (req, res) => {
//   const { name, email, password, pic, group, gender, dateOfBirth, status } =
//     req.body;

//   const sql = `INSERT INTO pi_db (number, id_,name_, email, password, group_, gender_, birthday_, status_) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
//   const values = [
//     id,
//     name,
//     email,
//     password,
//     pic,
//     group,
//     gender,
//     dateOfBirth,
//     status,
//   ];

//   connection.query(sql, values, (error, results, fields) => {
//     if (error) {
//       console.error("Помилка запиту до бази даних:", error);
//       res.status(500).json({ error: "Помилка запиту до бази даних" });
//     } else {
//       console.log("Рядок успішно додано до бази даних");
//       res.status(200).json({ message: "Рядок успішно додано до бази даних" });
//     }
//   });
// });

app.get("/", (req, res) => {
  res.send("API Running!");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;
const onlineUsers = new Set();

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
  ///////////////////
  socket.on("userLoggedIn", ({ userId }) => {
    if (!onlineUsers.has(userId)) {
      onlineUsers.add(userId);
      updateUsers();
      console.log(`${userId} logged in. Online users: ${[...onlineUsers]}`);
    }
  });

  // При виході користувача з системи
  socket.on("userLoggedOut", ({ userId }) => {
    if (onlineUsers.has(userId)) {
      onlineUsers.delete(userId);
      updateUsers();
      console.log(
        `User ${userId} logged out. Online users: ${[...onlineUsers]}`
      );
    }
  });

  function updateUsers() {
    io.emit("onlineUsers", Array.from(onlineUsers));
  }

  ///////////////////
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
