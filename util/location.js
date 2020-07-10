const axios = require("axios");

const HttpError = require("../models/http-error");

const getCoordsForAddress = async (address) => {
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
        )}&key=${process.env.GOOGLE_API_KEY}`
    );

    const data = response.data;

    if (!data || data.status === "ZERO_RESULTS") {
        throw new HttpError(
            "주소에 해당하는 좌표 정보를 불러오는데 실패하였습니다.",
            422
        );
    }

    const coordinates = data.results[0].geometry.location;

    return coordinates;
};

exports.getCoordsForAddress = getCoordsForAddress;
