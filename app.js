const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors')

const projectsRoutes = require('./api/routes/projects');
const accountsRoutes = require('./api/routes/accounts');
const applicationsRoutes = require('./api/routes/jobs');
const favoritesRoutes = require('./api/routes/favorites');
const commentairesRoutes = require('./api/routes/commentaires');
const publicationsRoutes = require('./api/routes/publications');
const messagesRoutes = require('./api/routes/messages');

app.use('/projects',projectsRoutes);
app.use('/accounts',accountsRoutes);
app.use('/jobs',applicationsRoutes);
app.use('/favorites', favoritesRoutes)
app.use('/commentaires', commentairesRoutes)
app.use('/publications', publicationsRoutes)
app.use('/messages', messagesRoutes)

app.use(bodyParser.urlencoded({
 extended: true
}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static('./upload'));
app.all('*', function (req, res, next) {
 res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization ,Accept');
 res.setHeader('Access-Control-Allow-Origin', '*');
 res.setHeader('Access-Control-Allow-Credentials', true);
 res.setHeader('Access-Control-Expose-Headers', 'Authorization');
 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
 res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
 next();
});

//app.use(morgan('dev'));
//app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({extended: false}));
app.use(bodyParser.urlencoded({
 extended: true
}));
app.use(express.static(__dirname))

module.exports = app;