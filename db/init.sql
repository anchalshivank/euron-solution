CREATE TABLE IF NOT EXISTS referral_map (
                                            referral_code TEXT NOT NULL UNIQUE,
                                            count INTEGER NOT NULL DEFAULT 0,
                                            PRIMARY KEY (referral_code)
    );

CREATE TABLE IF NOT EXISTS referral_owners (
                                               user_address TEXT NOT NULL,
                                               referral_code TEXT NOT NULL,
                                               is_manager_code BOOLEAN NOT NULL DEFAULT FALSE,
                                               created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_address, referral_code)
    );
