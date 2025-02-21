use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, PartialEq, Debug, Deserialize)]
pub struct CreateRefRequest{
    pub address: String,
    pub ref_code: String,
    pub is_manager_code: bool
}
