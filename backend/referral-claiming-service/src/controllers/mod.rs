use std::sync::{Arc, Mutex};
use ntex::web;
use ntex::web::{HttpResponse, Responder};
use crate::models::database::ReferralMap;
use crate::response::ApiResponse;
use crate::services::Services;




#[web::get("/health")]
pub async fn get_health() -> impl Responder {
    let api_response: ApiResponse<(), ()> = ApiResponse::success("Service is healthy", None::<()>);
    HttpResponse::Ok().json(&api_response)
}


#[web::post("/claim/{referral_code}")]
async fn claim_referral(
    services: web::types::State<Arc<Mutex<Services>>>,
    query: web::types::Path<String>,
) -> impl Responder {
    let referral_code = query.into_inner();

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
    match service_guard.claim_referral(referral_code).await {
        Ok(_) => {
            let api_response: ApiResponse<ReferralMap, String> =
                ApiResponse::success("RefCode claimed", None);
            HttpResponse::Ok().json(&api_response)
        }
        Err(error) => error.error_response(),
    }
}
