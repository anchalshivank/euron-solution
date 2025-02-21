
use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};
use crate::error::ReferralError;
use crate::models::database::{ReferralOwner, ReferralMap};
use crate::repositories::ReferralRepository;

pub struct Services {
    pub referral_service: Arc<Mutex<ReferralService>>,
}


#[derive(Clone, Serialize, Deserialize)]
pub struct RefCode{
    ref_code: String
}
#[derive(Clone)]
pub struct ReferralService {
    repository: Arc<Mutex<ReferralRepository>>,
}

impl ReferralService {
    pub fn new(repository: Arc<Mutex<ReferralRepository>>) -> Self {
        Self { repository }
    }


    pub async fn referrals(&self) -> Result<Vec<ReferralOwner>, ReferralError> {
        match self.repository.lock() {
            Ok(repository) => {
                let a = repository.referrals().await?;
                let result = a.iter().map(|val| val.clone()).collect();
                Ok(result)
            }
            Err(_) => Err(ReferralError::InternalError),
        }
    }

    pub async fn available_referrals(&self) -> Result<Vec<ReferralMap>, ReferralError> {
        match self.repository.lock() {
            Ok(repository) => {
                let result = repository.available_referrals().await?; // Await and propagate errors properly
                Ok(result) // Return the result
            }
            Err(_) => Err(ReferralError::InternalError), // Handle locking failure
        }
    }


    pub async fn get_ref(
        &self,
        user_address: String
    ) -> Result<RefCode, ReferralError> {

        match self.repository.lock() {

            Ok(repository) => {
                let ref_code = repository.get_ref(user_address).await?;
                let a= RefCode{
                    ref_code
                };
                Ok(a)
            }
            Err(_) => Err(ReferralError::InternalError),
        }


    }
}
