const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash('error', 'Please log in to continue');
  res.redirect('/auth/login');
};

module.exports = { isAuthenticated };