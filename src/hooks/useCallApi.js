import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useCallApi = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return useCallback(
        (api, resolve, message, reject) => {
            if (!api) {
                console.error("useCallApi: api is undefined or null");
                return;
            }

            if (typeof api === "function") {
                return api()
                    .then((res) => {
                        if (typeof resolve === "function") {
                            resolve(res);
                        }
                        if (typeof message === "string") {
                            toast.success(message);
                        }
                        return Promise.resolve(res);
                    })
                    .catch((err) => {
                        console.error("API Error Full Details:", {
                            error: err,
                            response: err.response,
                            status: err.response?.status,
                            message: err.message,
                        });
                        if (err?.response?.status === 401) {
                            toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
                            localStorage.removeItem("token");
                            localStorage.removeItem("username");
                            navigate("/");
                        } else if (err.message === "Network Error") {
                            toast.error("Không thể kết nối đến server, vui lòng kiểm tra lại mạng!");
                            // Có thể điều hướng hoặc xử lý khác nếu cần
                        } else {
                            if (typeof reject === "function") {
                                reject(err);
                            }
                            toast.error(err?.message ?? "Thao tác không thành công, vui lòng thử lại");
                        }
                    });
            }

            if (Array.isArray(api) && api.length > 0) {
                const promises = api.map((p) =>
                    typeof p === "function" ? p() : Promise.resolve(p)
                );
                return Promise.allSettled(promises)
                    .then((results) => {
                        const values = results.map((item) =>
                            item.status === "fulfilled" ? item.value : null
                        );
                        if (typeof resolve === "function") {
                            resolve(values);
                        }
                        if (typeof message === "string") {
                            toast.success(message);
                        }
                        return values;
                    })
                    .catch((err) => {
                        console.error("API Error Full Details:", {
                            error: err,
                            response: err.response,
                            status: err.response?.status,
                            message: err.message,
                        });
                        if (err?.response?.status === 401) {
                            toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
                            localStorage.removeItem("token");
                            localStorage.removeItem("username");
                            navigate("/");
                        } else if (err.message === "Network Error") {
                            toast.error("Không thể kết nối đến server, vui lòng kiểm tra lại mạng!");
                            // Có thể điều hướng hoặc xử lý khác nếu cần
                        } else if (typeof reject === "function") {
                            reject(err);
                        }
                    });
            } else {
                console.error("useCallApi: api is not a valid array of promises");
            }
        },
        [dispatch, navigate]
    );
};

export default useCallApi;