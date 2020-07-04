const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use(cors());

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
    throw new HttpError("존재하지 않는 라우트", 404);
});

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || "알 수 없는 에러 발생" });
});

mongoose
    .connect(
        "mongodb+srv://hyunho:vX3z0RhUB6S77ZRC@cluster0-dzgjd.mongodb.net/trippic?retryWrites=true&w=majority"
    )
    .then(() => {
        console.log("DB 연결 성공");
        app.listen(5000);
    })
    .catch(() => {
        console.log("DB 연결 실패");
    });
