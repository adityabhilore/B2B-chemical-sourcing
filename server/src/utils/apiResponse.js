export const successResponse = (data, message = 'Request successful') => ({
  success: true,
  data,
  message,
  errors: null,
});

export const errorResponse = (message, errors = null) => ({
  success: false,
  data: null,
  message,
  errors,
});

export function sendSuccess(res, data, message = 'Request successful', status = 200) {
  return res.status(status).json(successResponse(data, message));
}
