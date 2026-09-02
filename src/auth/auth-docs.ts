export const authDocs = {
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login a user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string" },
              },
              required: ["email", "password"],
            },
          },
        },
      },
      responses: {
        201: { description: "User logged in successfully" },
        401: { description: "Incorrect credentials" },
        403: { description: "User account is not verified" },
        404: { description: "User with email does not exist" },
      },
    },
  },
  "/auth/login/google": {
    post: {
      tags: ["Auth"],
      summary: "Login a user with Google",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                token: { type: "string", description: "Google ID Token" },
              },
              required: ["token"],
            },
          },
        },
      },
      responses: {
        201: { description: "User logged in successfully" },
        400: { description: "Invalid OAuth credentials" },
      },
    },
  },
  "/auth/password-reset": {
    patch: {
      tags: ["Auth"],
      summary: "Request a password reset OTP",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                email: { type: "string", format: "email" },
              },
              required: ["email"],
            },
          },
        },
      },
      responses: {
        200: { description: "Password reset email sent" },
        404: { description: "User with email does not exist" },
      },
    },
  },
  "/auth/update-password": {
    patch: {
      tags: ["Auth"],
      summary: "Update user password with OTP",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                otp: { type: "string" },
                password: { type: "string" },
                confirmPassword: { type: "string" },
              },
              required: ["otp", "password", "confirmPassword"],
            },
          },
        },
      },
      responses: {
        200: { description: "Password updated successfully" },
        400: { description: "Invalid or expired OTP" },
      },
    },
  },
  "/auth/new-access-token": {
    get: {
      tags: ["Auth"],
      summary: "Generates a new access token",
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        403: { description: "invalid jwt token" },
        200: { description: "New access token generated successfully" },
      },
    },
  },
};
