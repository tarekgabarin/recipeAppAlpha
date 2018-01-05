/// hold application secrets and strings
/// add this to .gitignore

module.exports = {
    'secretKey': process.env.SECRET_CODE,
    'mongoUrl' : process.env.MONGODB_URI
};
