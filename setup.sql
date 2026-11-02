CREATE DATABASE sictc_giveaway;
USE sictc_giveaway;

CREATE TABLE entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    school VARCHAR(100) NOT NULL,
    t_shirt_size VARCHAR(5) NOT NULL,
    interested_programs VARCHAR(255),
    evsc_student VARCHAR(5) NOT NULL,
    seen_at_options_fair VARCHAR(10) NOT NULL,
    submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);