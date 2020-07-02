const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const { getCoordsForAddress } = require("../util/location");
const Place = require("../models/place");

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError("입력 값에 문제가 있습니다.", 422);
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
        creator,
        location: coordinates,
        imageUrl:
            "https://hyunhodl.github.io/my-portfolio/static/media/profile-image.1bc06f07.jpg",
    });

    try {
        await createdPlace.save();
    } catch (error) {
        return next(new HttpError("새로운 여행지 등록에 실패", 500));
    }

    res.status(201).json({ place: createdPlace });
};

exports.createPlace = createPlace;
