const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuidv4 } = require("uuid");

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
});

const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpg": "jpg",
    "image/jpeg": "jpeg",
};

const fileUpload = multer({
    limits: 500 * 1000, // 500kb
    storage: multerS3({
        s3: s3,
        bucket: "trippic-uploads/images",
        key: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype];
            cb(null, uuidv4() + "." + ext);
        },
        acl: "public-read-write",
    }),
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        let error = isValid ? null : new Error("유효하지 않은 MIME TYPE");
        cb(error, isValid);
    },
});

const fileDelete = (key) => {
    s3.deleteObject(
        {
            Bucket: "trippic-uploads/images",
            Key: key,
        },
        (err, data) => {
            if (err) {
                console.log(err);
            } else {
                console.log(data);
            }
        }
    );
};

// const fileUpload = multer({
//     limits: 500 * 1000, // 500kb
//     storage: multer.diskStorage({
//             cb(null, "uploads/images");
//         },
//         destination: (req, file, cb) => {
//         filename: (req, file, cb) => {
//             const ext = MIME_TYPE_MAP[file.mimetype];
//             cb(null, uuidv4() + "." + ext);
//         },
//     }),
//     fileFilter: (req, file, cb) => {
//         const isValid = !!MIME_TYPE_MAP[file.mimetype];
//         let error = isValid ? null : new Error("유효하지 않은 MIME TYPE");
//         cb(error, isValid);
//     },
// });

exports.fileUpload = fileUpload;
exports.fileDelete = fileDelete;
