export const userDocs = {
    "/users": {
        post: {
            tags: ["Users"],
            summary: "Create a new user",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                firstName: { type: "string" },
                                lastName: { type: "string" },
                                email: { type: "string" },
                                phoneNumber: { type: "string" },
                                password: { type: "string" },
                                confirmPassword: { type: "string" },
                            },
                            required: [
                                "firstName",
                                "lastName",
                                "email",
                                "phoneNumber",
                                "password",
                                "confirmPassword",
                            ],
                        },
                    },
                },
            },
            responses: {
                201: { description: "User created successfully" },
            },
        },
    },
    "/users/verify": {
        post: {
            tags: ["Users"],
            summary: "Verify user account",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                otp: { type: "string" },
                            },
                            required: ["otp"],
                        },
                    },
                },
            },
            responses: {
                201: { description: "Account verified successfully" },
            },
        },
    },
    "/users/profile": {
        get: {
            tags: ["Users"],
            summary: "Get current user profile data",
            responses: {
                200: { description: "User verified successfully" },
            },
        },
    },
};
