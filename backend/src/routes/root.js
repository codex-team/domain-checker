const rootRoute = (req, res) => {
  res.statusCode = 200;
  res.end('Hello, World!\n');
};

module.exports = rootRoute;
