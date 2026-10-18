export function sendValidationError(res, error) {
  return res.status(422).json({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Please check the submitted fields.",
      details: error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
    }
  });
}
