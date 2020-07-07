const { validationResult } = require("express-validator");

const User = require("../models/user");
const HttpError = require("../models/http-error");

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, "-password");
    } catch (error) {
        return next(error);
    }
    res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError("입력이 유효하지 않음", 422);
        return next(error);
    }

    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch (error) {
        return next(error);
    }
    if (existingUser) {
        const error = new HttpError("이미 존재하는 이메일", 422);
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        password,
        imageUrl: req.file.path,
        places: [],
    });

    try {
        await createdUser.save();
    } catch (error) {
        const err = new HttpError(error.message, 500);
        return next(err);
    }

    res.status(201).json({
        message: "회원가입 완료",
        user: createdUser.toObject({ getters: true }),
    });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch (error) {
        return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError("인증 실패", 401);
        return next(error);
    }

    res.json({
        message: "로그인 완료",
        user: existingUser.toObject({ getters: true }),
    });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
