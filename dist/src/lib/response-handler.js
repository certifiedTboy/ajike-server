export class ResponseHandler {
    static created(res, statusCode, message, data) {
        res.status(statusCode).json({
            success: true,
            statusCode,
            message,
            data,
        });
    }
    static ok(res, statusCode, message, data) {
        res.status(statusCode).json({
            success: true,
            statusCode,
            message,
            data,
        });
    }
    static auth(res, statusCode, message, data) {
        const cookieOptions = {
            expires: new Date(Date.now() + 60 * 60 * 1000),
            maxAge: 60 * 60 * 1000,
            secure: true,
            httpOnly: true,
            sameSite: "none",
        };
        return res
            .status(statusCode)
            .cookie("authToken", data?.accessToken, cookieOptions)
            .json({ message, refreshToken: data?.refreshToken, data: data?.user });
    }
    static logout(res, statusCode, message, _data) {
        return res.status(statusCode).clearCookie("authToken").json({ message });
    }
}
