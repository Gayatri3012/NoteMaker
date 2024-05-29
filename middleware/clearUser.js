exports.clearUser = (req, res, next) => {
    req.user = null;
    next();
}