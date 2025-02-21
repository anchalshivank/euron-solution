use crate::database::DbPool;
use ntex::web;
use std::sync::{Arc, Mutex};

use diesel::sql_types::{Bool, Text};
use diesel::RunQueryDsl;
use log::info;
use ntex::http::error::BlockingError;
use crate::error::ReferralError;
use crate::models::database::{CountResult, ReferralCodeResult};
use crate::models::request::CreateRefRequest;

#[derive(Clone)]
pub struct ReferralRepository {
    pub pool: Arc<Mutex<DbPool>>,
}




impl ReferralRepository {
    pub fn new(pool: Arc<Mutex<DbPool>>) -> Self {
        ReferralRepository { pool }
    }

    pub async fn create_ref(&self, req: CreateRefRequest) -> Result<(), ReferralError> {
        let user_address = req.address;
        let ref_code = req.ref_code;
        let is_manager_code = req.is_manager_code;

        match self.pool.lock() {
            Ok(pool) => {
                let pool_clone = pool.clone();
                let result = web::block(move || {
                    let mut conn = pool_clone.get().map_err(|_| ReferralError::ConnectionError)?;

                    // ✅ Corrected Count Query
                    let count_query = r#"
                    SELECT COUNT(*) as count FROM referral_owners WHERE user_address = $1;
                "#;
                    let referral_count: CountResult = diesel::sql_query(count_query)
                        .bind::<Text, _>(&user_address)
                        .get_result::<CountResult>(&mut conn)
                        .map_err(ReferralError::DatabaseError)?;

                    if referral_count.count >= 10 {
                        info!("Count is 10");
                        return Err(ReferralError::ReferralLimitExceeded);
                    }

                    // Step 1: Insert into referral_owners
                    let insert_owner_query = r#"
                    INSERT INTO referral_owners (user_address, referral_code, is_manager_code)
                    VALUES ($1, $2, $3)
                    RETURNING referral_code;
                "#;

                    let referral_code_result: ReferralCodeResult = diesel::sql_query(insert_owner_query)
                        .bind::<Text, _>(&user_address)
                        .bind::<Text, _>(&ref_code)
                        .bind::<Bool, _>(&is_manager_code)
                        .get_result::<ReferralCodeResult>(&mut conn)
                        .map_err(ReferralError::DatabaseError)?;

                    let referral_code = referral_code_result.referral_code;

                    // Step 2: Insert or update referral_map
                    let insert_or_update_user_query = r#"
                    INSERT INTO referral_map (referral_code, count)
                    VALUES ($1, 1)
                    ON CONFLICT (referral_code) DO UPDATE
                    SET count = referral_map.count + 1;
                "#;

                    diesel::sql_query(insert_or_update_user_query)
                        .bind::<Text, _>(&referral_code)
                        .execute(&mut conn)
                        .map_err(|e| ReferralError::DatabaseError(e))?;

                    Ok(())
                })
                    .await
                    .map_err(|blocking_err| match blocking_err {
                        BlockingError::Error(e) => e,
                        BlockingError::Canceled => ReferralError::InternalError,
                    })?;

                info!("Generated referral code result: {:?}", result);
                Ok(result)
            }
            Err(_) => Err(ReferralError::InternalError),
        }
    }


}
