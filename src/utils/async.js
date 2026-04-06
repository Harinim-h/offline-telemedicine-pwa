export function withTimeout(promise, timeoutMs = 8000, errorMessage = "request-timeout") {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);

    Promise.resolve(promise)
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}
