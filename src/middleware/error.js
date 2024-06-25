import {EErrors} from "../services/errors/enum.js";

const manejadorError = (error, req, res, next) => {
    console.log(error.cause) 
    switch(error.code) {
        case EErrors.PROUDUCT_VALIDATION_ERROR:
            res.send({status: "error", error: error.name})
            break;
        case EErrors.PRODUCT_ALREADY_EXIST:
            res.send({status: "error", error: error.name})
            break;
        case EErrors.PRODUCT_NOT_FOUND:
            res.send({status: "error", error: error.name})
            break;
        case EErrors.USER_REGISTER_ERROR:
            res.send({status: "error", error: error.name})
            break;
        case EErrors.USER_ALREADY_EXIST:
            res.send({status: "error", error: error.name})
            break;
        default:
            res.status({status: "error", error: "Error desconocido"})
        }
}

export default manejadorError;