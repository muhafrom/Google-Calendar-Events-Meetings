export const logger = (req, res, next) => {
    res.on("finish", () => {
        console.info(
            `${new Date().toISOString()} Finished ${req.method} ${req.originalUrl} status ${res.statusCode} ${res.get("content-length")} - ${req.get("user-agent")} ${req.ip}`
        );
    });
    next();
};
