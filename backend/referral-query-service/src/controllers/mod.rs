use std::sync::{Arc, Mutex};
use ntex::web;
use ntex::web::{HttpResponse, Responder};
use serde::{Serialize, Serializer};
use serde::ser::SerializeStruct;
use crate::models::database::{ReferralOwner, ReferralMap};
use crate::services::{RefCode, Services};

#[derive(Debug)]
pub struct ApiResponse<T, E> {
    success: bool,
    message: String,
    data: Option<T>,
    error: Option<E>,
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

#[web::get("/health")]
pub async fn get_health() -> impl Responder {
    let api_response: ApiResponse<(), ()> = ApiResponse::success("Service is healthy", None::<()>);
    HttpResponse::Ok().json(&api_response)
}


#[web::get("/referrals")]
async fn referrals(services: web::types::State<Arc<Mutex<Services>>>) -> impl Responder {
    let services_guard = match services.lock() {
        Ok(guard) => guard,
        Err(_) => {
            return HttpResponse::InternalServerError().json(&ApiResponse::<(), &str>::error(
                "Failed to acquire services lock",
                "Internal Server Error",
            ))
        }
    };

    let service_guard = match services_guard.referral_service.lock() {
        Ok(guard) => guard,
        Err(_) => {
            return HttpResponse::InternalServerError().json(&ApiResponse::<(), &str>::error(
                "Failed to acquire referral service lock",
                "Internal Server Error",
            ))
        }
    };

    match service_guard.referrals().await {
        Ok(referrals) => {
            let api_response: ApiResponse<Vec<ReferralOwner>, ()> =
                ApiResponse::success("Referrals retrieved successfully", Some(referrals));
            HttpResponse::Ok().json(&api_response)
        }
        Err(error) => error.error_response()
    }
}

#[web::get("/available_referrals")]
async fn available_referrals(
    services: web::types::State<Arc<Mutex<Services>>>,
) -> impl Responder {
    let services_guard = match services.lock() {
        Ok(guard) => guard,
        Err(_) => {
            return HttpResponse::InternalServerError().json(&ApiResponse::<(), &str>::error(
                "Failed to acquire services lock",
                "Internal Server Error",
            ))
        }
    };

    let service_guard = match services_guard.referral_service.lock() {
        Ok(guard) => guard,
        Err(_) => {
            return HttpResponse::InternalServerError().json(&ApiResponse::<(), &str>::error(
                "Failed to acquire referral service lock",
                "Internal Server Error",
            ))
        }
    };

    match service_guard.available_referrals().await {
        Ok(available_referrals) => {
            let api_response: ApiResponse<Vec<ReferralMap>, ()> =
                ApiResponse::success("Referrals retrieved successfully", Some(available_referrals));
            HttpResponse::Ok().json(&api_response)
        }
        Err(error) => error.error_response()
    }
}


#[web::get("/address/{user_address}")]
async fn get_ref(
    services: web::types::State<Arc<Mutex<Services>>>,
    query: web::types::Path<String>
) -> impl Responder {
    let user_address = query.into_inner();

    // Get a reference to the services mutex
    let services_guard = match services.lock() {
        Ok(guard) => guard,
        Err(_) => {
            return HttpResponse::InternalServerError().json(&ApiResponse::<(), &str>::error(
                "Failed to acquire services lock",
                "Internal Server Error",
            ))
        }
    };

    // Get a reference to the referral service mutex
    let service_guard = match services_guard.referral_service.lock() {
        Ok(guard) => guard,
        Err(_) => {
            return HttpResponse::InternalServerError().json(&ApiResponse::<(), &str>::error(
                "Failed to acquire referral service lock",
                "Internal Server Error",
            ))
        }
    };

    // Generate the referral code
    match service_guard.get_ref(user_address).await {
        Ok(code) => {
            let api_response: ApiResponse<RefCode, String> =
                ApiResponse::success("RefCode claimed", Some(code));
            HttpResponse::Ok().json(&api_response)
        }
        Err(error) => error.error_response(),
    }

}
