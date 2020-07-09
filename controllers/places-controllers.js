const fs = require("fs");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const { getCoordsForAddress } = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.placeId;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (error) {
        return next(error);
    }

    if (!place) {
        const error = new HttpError("장소 아이디와 매칭되는 장소가 없음.", 404);
        return next(error);
    }

    res.json({ place });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.userId;

    let user;
    try {
        user = await User.findById(userId).populate("places");
    } catch (error) {
        return next(error);
    }

    if (!user || user.places.length === 0) {
        const err = new HttpError("유저 아이디에 해당하는 장소가 없음", 404);
        return next(err);
    }

    res.json({
        places: user.places.map((place) => place.toObject({ getters: true })),
    });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError("유효하지 않은 입력", 422);
        return next(error);
    }

    const { title, description, address, creator } = req.body;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        creator,
        image: req.file.path,
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (error) {
        return next(error);
    }

    if (!user) {
        const error = new HttpError("존재하지 않는 유저", 422);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (error) {
        return next(error);
    }

    res.status(201).json({ place: createdPlace.toObject({ getters: true }) });
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError("유효하지 않은 입력", 422);
        return next(error);
    }

    const placeId = req.params.placeId;
    const { title, description } = req.body;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (error) {
        return next(error);
    }

    if (!place) {
        const error = new HttpError("존재하지 않는 장소", 404);
        return next(error);
    }

    if (place.creator.toString() !== req.userData.userId) {
        const error = new HttpError("권한이 없습니다.", 401);
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (error) {
        return next(error);
    }

    res.json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.placeId;

    let place;
    try {
        place = await Place.findById(placeId).populate("creator");
    } catch (error) {
        return next(error);
    }

    if (!place) {
        const error = new HttpError("존재하지 않는 장소", 404);
        return next(error);
    }

    console.log("장소에서 얻은 아이디", place.creator.toString());
    console.log("토큰에서 얻은 아이디", req.userData.userId);

    if (place.creator.id !== req.userData.userId) {
        const error = new HttpError("권한이 없습니다.", 401);
        return next(error);
    }

    const imagePath = place.image;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (error) {
        return next(error);
    }

    fs.unlink(imagePath, (err) => console.log(err));

    res.json({ message: "장소 삭제 완료" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
