import multer from "multer";


const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './public/temp');
    },

    filename: function(req, file, cb){
        //TODO: For changing the file name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
        // cb(null, file.filename + '-' + uniqueSuffix);
    }
})

export const upload = multer({
    storage
})