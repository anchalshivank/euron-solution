use diesel::QueryableByName;
use serde::{Deserialize, Serialize};

#[derive(QueryableByName, Debug, Clone, Serialize, Deserialize)]
pub struct ReferralOwner {
    #[diesel(sql_type = diesel::sql_types::Text)]
    pub user_address: String,
    #[diesel(sql_type = diesel::sql_types::Text)]
    pub referral_code: String,
    #[diesel(sql_type = diesel::sql_types::Bool)]
    pub is_manager_code: bool,
}

#[derive(QueryableByName, Debug, Clone, Serialize, Deserialize)]
pub struct ReferralMap {
    #[diesel(sql_type = diesel::sql_types::Integer)]
    pub count: i32,
    #[diesel(sql_type = diesel::sql_types::Text)]
    pub referral_code: String
}


#[derive(QueryableByName)]
pub struct ReferralCodeResult {
    #[diesel(sql_type = diesel::sql_types::Text)]
    pub(crate) referral_code: String,
}
