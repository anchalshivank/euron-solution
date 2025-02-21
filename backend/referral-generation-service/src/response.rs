use serde::{Serialize, Serializer};
use serde::ser::SerializeStruct;

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

impl<T: Serialize, E: Serialize> Serialize for ApiResponse<T, E> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("ApiResponse", 2)?;
        state.serialize_field("success", &self.success)?;
        state.serialize_field("message", &self.message)?;

        if let Some(ref data) = &self.data {
            state.serialize_field("data", data)?;
        }
        if let Some(ref error) = &self.error {
            state.serialize_field("error", error)?;
        }

        state.end()
    }
}
