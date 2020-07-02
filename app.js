const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

mongoose
    .connect(
        "mongodb+srv://hyunho:vX3z0RhUB6S77ZRC@cluster0-dzgjd.mongodb.net/places?retryWrites=true&w=majority"
    )
    .then(() => {
        console.log("DB 연결 성공");
        app.listen(5000);
    })
    .catch(() => {
        console.log("DB 연결 실패");
    });
