use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};
use crate::error::ReferralError;
use crate::repositories::ReferralRepository;

pub struct Services {
    pub referral_service: Arc<Mutex<ReferralService>>,
}

#[derive(Clone)]
pub struct ReferralService {
    repository: Arc<Mutex<ReferralRepository>>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct RefCode{
    ref_code: String
}
impl ReferralService {
    pub fn new(repository: Arc<Mutex<ReferralRepository>>) -> Self {
        Self { repository }
    }

    pub async fn claim_referral(
        &self,
        referral_code: String
    ) -> Result<(), ReferralError> {
        match self.repository.lock() {
            Ok(repository) => {
                Ok(repository.claim_referral(referral_code).await?)
            }
            Err(_) => Err(ReferralError::InternalError),
        }
    }

}
