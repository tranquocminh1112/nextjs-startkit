const express = require('express');
const cookieParser = require('cookie-parser');
const next = require('next');
const proxy = require('http-proxy-middleware');
const Configs = require('./src/config/index');
const Helpers = require('./src/functions/helpers');
const routes = require('./src/routes');

const port = parseInt(process.env.PORT, 10) || 4000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({dir: `./src`, dev});
const handle = routes.getRequestHandler(app);

const authChecker = (req, res, next) => {
	if (req.cookies.token || req.path === Configs.loginPath || Helpers.isExceptionUrl(req.path)) {
		next();
	} else {
		res.redirect(Configs.loginPath);
	}
};

app.prepare().then(() => {
	const server = express();
	server.use(cookieParser());
	server.use('/api', proxy({target: dev ? Configs.api_dev : Configs.api_prod, changeOrigin: true, logLevel: 'debug'}));
	server.use(authChecker);
	server.use(handle);
	server.listen(port, (err) => {
		if (err) throw err;
		console.log(`> Ready on http://localhost:${port}`)
	})
});
