use crate::database::DbPool;
use diesel::RunQueryDsl;
use ntex::web;
use std::sync::{Arc, Mutex};

use crate::error::ReferralError;
use crate::models::database::ReferralMap;
use ntex::http::error::BlockingError;

#[derive(Clone)]
pub struct ReferralRepository {
    pub pool: Arc<Mutex<DbPool>>,
}


impl ReferralRepository {
    pub fn new(pool: Arc<Mutex<DbPool>>) -> Self {
        ReferralRepository { pool }
    }

    pub async fn claim_referral(
        &self,
        referral_code: String,
    ) -> Result<(), ReferralError> {
        match self.pool.lock() {
            Ok(pool) => {
                let pool_clone = pool.clone();

                let result = web::block::<_, (), ReferralError>(move || {
                    let mut conn = pool_clone
                        .get()
                        .map_err(|_| ReferralError::ConnectionError)?;

                    // ✅ Check if referral code exists in referral_map
                    let check_query = r#"
                    SELECT count, referral_code FROM referral_map WHERE referral_code = $1;
                "#;

                    let ru: ReferralMap = diesel::sql_query(check_query)
                        .bind::<diesel::sql_types::Text, _>(&referral_code)
                        .get_result::<ReferralMap>(&mut conn)
                        .map_err(ReferralError::DatabaseError)?;

                    // ✅ If count < 1, prevent claiming
                    if ru.count < 1 {
                        return Err(ReferralError::ReferralNotFound);
                    } else {
                        // ✅ Subtract 1 from referral count
                        let update_query = r#"
                        UPDATE referral_map SET count = count - 1 WHERE referral_code = $1;
                    "#;

                        diesel::sql_query(update_query)
                            .bind::<diesel::sql_types::Text, _>(&referral_code)
                            .execute(&mut conn)
                            .map_err(ReferralError::DatabaseError)?;
                    }

                    Ok(())
                })
                    .await
                    .map_err(|blocking_err| match blocking_err {
                        BlockingError::Error(e) => e,
                        BlockingError::Canceled => ReferralError::InternalError,
                    })?;

                Ok(result)
            }
            Err(_) => Err(ReferralError::InternalError),
        }
    }

}