#[derive(Debug)]
pub struct ApiResponse<T, E> {
    pub(crate) success: bool,
    pub(crate) message: String,
    pub(crate) data: Option<T>,
    pub(crate) error: Option<E>,
}

impl<T, E> ApiResponse<T, E> {
    pub fn success(message: &str, data: Option<T>) -> Self {
        ApiResponse {
            success: true,
            message: message.to_string(),
            data,
            error: None,
        }
    }

    pub fn error(message: &str, error: E) -> Self {
        ApiResponse {
            success: false,
            message: message.to_string(),
            data: None,
            error: Some(error),
        }
    }
}
