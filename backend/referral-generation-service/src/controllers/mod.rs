use std::sync::{Arc, Mutex};
use log::info;
use ntex::web;
use ntex::web::{HttpResponse, Responder};
use crate::models::request::CreateRefRequest;
use crate::response::ApiResponse;
use crate::services::Services;



#[web::get("/health")]
pub async fn get_health() -> impl Responder {
    let api_response: ApiResponse<(), ()> = ApiResponse::success("Service is healthy", None::<()>);
    HttpResponse::Ok().json(&api_response)
}



#[web::post("/create_ref")]
async fn create_ref(
    services: web::types::State<Arc<Mutex<Services>>>,
    ref_req: web::types::Json<CreateRefRequest>,
) -> impl Responder {

    let req = ref_req.0;

    info!("the request is {:?}", req);

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
    match service_guard.create_ref(req).await {
        Ok(_) => {
            let api_response: ApiResponse<String, String> =
                ApiResponse::success("RefCode is generated", None);
            HttpResponse::Ok().json(&api_response)
        }
        Err(error) => error.error_response()
    }
}



