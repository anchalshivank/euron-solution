mod database;

use std::env;
use dotenv::dotenv;
use log::info;
use ntex::web;
use ntex::web::middleware;
use std::sync::{Arc, Mutex};
use http::header::{AUTHORIZATION, CONTENT_TYPE};
use ntex_cors::Cors;
use referral_claiming_service::controllers::{claim_referral, get_health};
use referral_claiming_service::repositories::ReferralRepository;
use referral_claiming_service::response::ApiResponse;
use referral_claiming_service::services::{ReferralService, Services};

#[ntex::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();
    info!("Starting Referral Service");
    let addr = env::var("SERVER_ADDR").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port: u16 = env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8082".to_string())
        .parse()
        .expect("SERVER_PORT must be a valid number");
    let pool = Arc::new(Mutex::new(database::establish_connection()));
    let referral_repository = Arc::new(Mutex::new(ReferralRepository::new(pool.clone())));
    let referral_service = Arc::new(Mutex::new(ReferralService::new(referral_repository)));

    let services = Arc::new(Mutex::new(Services { referral_service }));

    web::HttpServer::new(move || {
        web::App::new()
            .wrap(middleware::Logger::default()) // Apply logging middleware first
            .wrap(
                Cors::new()
                    .send_wildcard() // Allow all origins
                    .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"]) // Specify methods explicitly
                    .allowed_headers(vec![CONTENT_TYPE, AUTHORIZATION])
                    .max_age(3600)
                    .finish(), // Cache preflight requests

            )
            .state(services.clone()) // Pass shared state
            .service(get_health)
            .service(claim_referral)
            .default_service(
                web::to(|| async {
                    let api_response = ApiResponse::<(), String>::error(
                        "API endpoint not found",
                        "The requested resource does not exist".to_string(),
                    );
                    web::HttpResponse::NotFound().json(&api_response)
                }),
            )
    })
        .bind((addr.as_str(), port))?
        .run()
        .await

}
