const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const { getCoordsForAddress } = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const { findById } = require("../models/place");

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError("유효하지 않은 입력 값", 422);
        return next(error);
    }

    const { title, description, address, creator } = req.body;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        const err = new HttpError("장소 생성 중 에러 발생", 500);
        return next(err);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        creator,
        imageUrl:
            "https://avatars0.githubusercontent.com/u/58314572?s=460&u=39e2a1d2c384262e78f69dbec557078a05dae19c&v=4",
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (error) {
        const err = new HttpError("장소 생성 중 에러 발생", 500);
        return next(err);
    }

    if (!user) {
        const error = new HttpError("존재하지 않는 유저", 422);
        return next(error);
    }

    try {
        const sess = mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await sess.commitTransaction();
    } catch (error) {
        const err = new HttpError("장소 생성 중 에러 발생", 500);
        return next(err);
    }

    res.status(201).json({ place: createdPlace.toObject({ getters: true }) });
};

exports.createPlace = createPlace;
