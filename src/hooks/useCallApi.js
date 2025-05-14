import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useCallApi = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useCallback(
    (api, resolve, reject) => {
      if (!api) {
        console.error("useCallApi: api is undefined or null");
        return Promise.reject(new Error("API is undefined or null"));
      }

      const handleError = (() => {
        let hasLoggedError = false;

        return (err) => {
          console.error("API Error Full Details:", {
            error: err,
            response: err.response,
            status: err.response?.status,
            message: err.message,
            responseData: err.responseData,
          });

          if (!hasLoggedError) {
            const errorMessage =
              err.responseData?.title ||
              err.responseData?.message ||
              "Thao tác không thành công, vui lòng thử lại";
            toast.error(errorMessage);
            hasLoggedError = true;
          }

          if (err?.response?.status === 401) {
            toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            navigate("/");
          } else if (err.message === "Network Error") {
            toast.error("Không thể kết nối đến server, vui lòng kiểm tra lại mạng!");
          }

          if (typeof reject === "function") {
            reject(err);
          }
          return Promise.reject(err);
        };
      })();

      if (typeof api === "function") {
        console.log("useCallApi: Executing single API call");
        return api()
          .then((res) => {
            console.log("useCallApi: Single API success", res);
            if (res && res.success === false) {
              const error = new Error(res.message || "API returned failure");
              error.response = { data: res };
              return handleError(error);
            }
            if (typeof resolve === "function") {
              resolve(res);
            }
            return Promise.resolve(res);
          })
          .catch((err) => {
            console.log("useCallApi: Single API error", err);
            return handleError(err);
          });
      }

      if (Array.isArray(api) && api.length > 0) {
        console.log("useCallApi: Executing multiple API calls", api);
        const promises = api.map((p) =>
          typeof p === "function" ? p() : Promise.resolve(p)
        );
        return Promise.allSettled(promises)
          .then((results) => {
            console.log("useCallApi: Promise.allSettled results", results);
            const values = [];
            const errors = [];

            results.forEach((item, index) => {
              if (item.status === "fulfilled") {
                const res = item.value;
                if (res && res.success === false) {
                  const error = new Error(res.message || "API returned failure");
                  error.response = { data: res };
                  errors.push(error);
                } else {
                  values[index] = res;
                }
              } else {
                errors.push(item.reason);
              }
            });

            if (errors.length > 0) {
              const error = errors[0];
              return handleError(error);
            }

            console.log("useCallApi: All APIs successful", values);
            if (typeof resolve === "function") {
              resolve(values);
            }
            return Promise.resolve(values);
          })
          .catch((err) => {
            console.log("useCallApi: Promise.allSettled error", err);
            return handleError(err);
          });
      }

      console.error("useCallApi: api is not a valid array of promises");
      return Promise.reject(new Error("API is not a valid array of promises"));
    },
    [dispatch, navigate]
  );
};

export default useCallApi;