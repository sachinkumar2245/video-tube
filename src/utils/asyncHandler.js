//higher order function which lets us handle errors more efficiently
const asyncHandler = (requestHandler) =>{ // we're not executing this funciton we're wrapping it up and sending it back
    return (req, res, next) =>{ //next is a middleware
        Promise.resolve(requestHandler(req, res, next)).catch
        ((err) => next(err))
    }

}

export {asyncHandler}