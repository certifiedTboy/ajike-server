import type { CookieOptions, Response } from "express";

export class ResponseHandler {
  public static created(
    res: Response,
    statusCode: number,
    message: string,
    data?: any,
  ) {
    res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  }

  public static ok(
    res: Response,
    statusCode: number,
    message: string,
    data?: any,
  ) {
    res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  }

  static auth(res: Response, statusCode: number, message: string, data?: any) {
    const cookieOptions: CookieOptions = {
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

  static logout(
    res: Response,
    statusCode: number,
    message: string,
    _data?: any,
  ) {
    return res.status(statusCode).clearCookie("authToken").json({ message });
  }
}
