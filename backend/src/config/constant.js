const constants = {
  httpCodes: {
    // Success
    ok: 200,
    created: 201,
    noContent: 204,

    // Client Error
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    conflict: 409,
    unprocessableContent: 422,
    tooManyRequests: 429,

    // Server error
    internalServerError: 500,
  },

  prismaCodes: {
    duplicate: "P2002",
  },
};

module.exports = constants;
