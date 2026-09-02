export function notFoundException(req, res) {
    res.status(404).json({
        error: "enpoint does not exist",
        path: req.originalUrl,
        method: req.method,
    });
}
