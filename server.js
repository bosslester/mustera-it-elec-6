const http = require('http');
const app = require('./backend/app');
const { error, debug } = require('console');

const normalizePort = (val) => {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        return val; // Named pipe
    }
    if (port >= 0) {
        return port; // Port number
    }
    return false;
};

const onError = (error) => {
    if (error.syscall !== "listen") {
        throw error;
    }

    const addr = server.address();
    const port = app.get("port");
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;

    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
};

const onListening = () => {
    const addr = server.address();
    const port = app.get("port");
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
    console.log("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || 3000);
app.set("port", port);

const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
server.listen(port);