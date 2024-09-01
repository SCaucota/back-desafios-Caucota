import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let destinationFolder;
        switch(file.fieldname) {
            case "profile":
                destinationFolder = "./src/uploads/profiles";
                break;
            case "products":
                destinationFolder = "./src/uploads/products";
                break;
            case "documents":
                destinationFolder = "./src/uploads/documents";
                break;
            case "img":
                destinationFolder = "./src/public/assets/images";
                break;
            default:
                break;
        }
        cb(null, destinationFolder);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({storage: storage});

export default upload