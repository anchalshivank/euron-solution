use crate::database::DbPool;
use diesel::{sql_query, OptionalExtension, RunQueryDsl};
use ntex::web;
use std::sync::{Arc, Mutex};

use crate::error::ReferralError;
use diesel::sql_types::{Text};
use log::{error};
use ntex::http::error::BlockingError;
use crate::models::database::{ReferralCodeResult, ReferralOwner, ReferralMap};

#[derive(Clone)]
pub struct ReferralRepository {
    pub pool: Arc<Mutex<DbPool>>,
}




impl ReferralRepository {
    pub fn new(pool: Arc<Mutex<DbPool>>) -> Self {
        ReferralRepository { pool }
    }

    pub async fn referrals(&self) -> Result<Vec<ReferralOwner>, ReferralError> {
        match self.pool.lock() {
            Ok(pool) => {
                let pool_clone = pool.clone();
                let result = web::block::<_, Vec<ReferralOwner>, ReferralError>(move || {
                    let mut conn = pool_clone
                        .get()
                        .map_err(|_| ReferralError::ConnectionError)?;

                    let query = r#"
                        SELECT * FROM referral_owners;
                        "#;

                    let referral_owners = sql_query(query)
                        .get_results(&mut conn)
                        .map_err(ReferralError::DatabaseError)?;

                    Ok(referral_owners)
                })
                    .await
                    .map_err(|blocking_err| match blocking_err {
                        BlockingError::Error(e) => {e}
                        BlockingError::Canceled => ReferralError::InternalError,
                    })?;

                Ok(result)
            }
            Err(_) => {
                error!("Failed to acquire database connection lock");
                Err(ReferralError::InternalError)
            }
        }
    }

    pub async fn available_referrals(&self) -> Result<Vec<ReferralMap>, ReferralError> {
        match self.pool.lock() {
            Ok(pool) => {
                let pool_clone = pool.clone();
                let result = web::block::<_, Vec<ReferralMap>, ReferralError>(move || {
                    let mut conn = pool_clone
                        .get()
                        .map_err(|_| ReferralError::ConnectionError)?;

                    let query = r#"
                    SELECT * FROM referral_map;
                "#;

                    let referral_owners: Vec<ReferralMap> = sql_query(query)
                        .get_results(&mut conn)
                        .map_err(|e|{
                            error!("Failed to get referral_map: {}", e);
                            ReferralError::DatabaseError(e)

                        }
                        )?;

                    Ok(referral_owners) // Ensure correct return type
                })
                    .await
                    .map_err(|blocking_err| match blocking_err {
                        BlockingError::Error(e) => {e}
                        BlockingError::Canceled => ReferralError::InternalError,
                    })?;

                Ok(result) // Return the retrieved referrals
            }
            Err(_) => Err(ReferralError::InternalError), // Return error on lock failure
        }
    }


    pub async fn get_ref(
        &self,
        user_address: String,
    ) -> Result<String, ReferralError> {
        match self.pool.lock() {
            Ok(pool) => {
                let pool_clone = pool.clone();
                let result = web::block(move || {
                    let mut conn = pool_clone
                        .get()
                        .map_err(|_| ReferralError::ConnectionError)?;

                    // SQL Query to fetch an available referral code
                    let query = r#"
    SELECT ro.referral_code
    FROM referral_owners ro
    WHERE ro.user_address = $1
    ORDER BY ro.created_at DESC
    LIMIT 1;
"#;


                    // Execute the query
                    let result: Option<String> = diesel::sql_query(query)
                        .bind::<Text, _>(&user_address)
                        .get_result::<ReferralCodeResult>(&mut conn) // Diesel returns a tuple for single-column queries
                        .optional() // Handle the case where no rows are returned
                        .map_err(|e|{
                            error!("Failed to get referral_map: {}", e);
                            ReferralError::DatabaseError(e)

                        })?
                        .map(|row| row.referral_code); // Extract the referral_code from the tuple

                    // Return the referral code or an error if none is available
                    result.ok_or(ReferralError::ReferralNotFound)
                })
                    .await
                    .map_err(|blocking_err| match blocking_err {
                        BlockingError::Error(e) => e, // Propagate the original ReferralError
                        BlockingError::Canceled => ReferralError::InternalError, // Handle thread pool cancellation
                    })?;

                Ok(result)
            }
            Err(_) => Err(ReferralError::InternalError),
        }
    }

}