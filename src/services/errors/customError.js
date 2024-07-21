class CustomError {
    static createError({name="Error", cause="Desconocido", message, code=1}){
        const error = new Error(message);
        error.name=name;
        error.cause=cause;
        error.code=code;
        return error;
    }
}

export default CustomError;