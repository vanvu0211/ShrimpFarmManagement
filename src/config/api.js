
const URLDomain = {
    baseURL: "https://shrimppond.runasp.net" + "/api",
    // baseURL: "https://localhost:7220" + "/api",
    headers: {
        "Content-Type": "application/json",
    },
    validateStatus: (status) => status < 400,
}

export {
    URLDomain,
}
