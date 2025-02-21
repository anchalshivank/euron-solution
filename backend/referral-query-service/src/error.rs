use crate::controllers::ApiResponse;
use diesel::result::Error as DieselError;
use http::StatusCode;
use ntex::web::HttpResponse;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ReferralError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] DieselError),

    #[error("User has reached the maximum limit of 10 referral codes")]
    ReferralLimitExceeded,

    #[error("Failed to acquire database connection")]
    ConnectionError,

    #[error("Internal server error")]
    InternalError,

    #[error("This referral does not exist")]
    ReferralNotFound,

    #[error("This referral has already been claimed")]
    ReferralAlreadyClaimed,
}

// Implement `ResponseError` for `ReferralError`
impl ReferralError {
    fn status_code(&self) -> StatusCode {
        match self {
            ReferralError::DatabaseError(_) => StatusCode::CONFLICT,
            ReferralError::ReferralLimitExceeded => StatusCode::BAD_REQUEST,
            ReferralError::ConnectionError => StatusCode::INTERNAL_SERVER_ERROR,
            ReferralError::InternalError => StatusCode::INTERNAL_SERVER_ERROR,
            ReferralError::ReferralNotFound => StatusCode::NOT_FOUND,
            ReferralError::ReferralAlreadyClaimed => StatusCode::BAD_REQUEST,
        }
    }

    pub fn error_response(&self) -> HttpResponse {
        let error_message = match self {
            ReferralError::DatabaseError(err) => {
                let error_msg = format!("Database error occurred during query: {}", err);
                error_msg
            },
            ReferralError::ReferralLimitExceeded => "Referral limit exceeded".to_string(),
            ReferralError::ConnectionError => "Connection error occurred".to_string(),
            ReferralError::InternalError => "Internal server error".to_string(),
            ReferralError::ReferralNotFound => "Referral not found".to_string(),
            ReferralError::ReferralAlreadyClaimed => "Referral already claimed".to_string(),
        };

        HttpResponse::build(self.status_code()).json(&ApiResponse::<(), &str>::error(&error_message, &error_message))
    }
}