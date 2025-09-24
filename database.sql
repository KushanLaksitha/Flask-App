-- Faculty Room & Equipment Management System Database Schema

CREATE DATABASE faculty_management_system;
USE faculty_management_system;

-- Users table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    index_number VARCHAR(10) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'faculty', 'administrator') NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(20) NOT NULL,
    room_name VARCHAR(100) NOT NULL,
    room_type ENUM('lecture_hall', 'lab', 'meeting_room', 'auditorium') NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(100),
    description TEXT,
    features JSON, -- Store features like projector, whiteboard, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Equipment table
CREATE TABLE equipment (
    equipment_id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_name VARCHAR(100) NOT NULL,
    equipment_type VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    description TEXT,
    location VARCHAR(100),
    purchase_date DATE,
    warranty_expiry DATE,
    condition_status ENUM('excellent', 'good', 'fair', 'poor', 'damaged') DEFAULT 'good',
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Room bookings table
CREATE TABLE room_bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT,
    expected_attendees INT,
    status ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

-- Equipment bookings table
CREATE TABLE equipment_bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    equipment_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT,
    project_name VARCHAR(100),
    status ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

-- Usage restrictions table
CREATE TABLE usage_restrictions (
    restriction_id INT PRIMARY KEY AUTO_INCREMENT,
    resource_type ENUM('room', 'equipment') NOT NULL,
    resource_id INT NOT NULL,
    restriction_type ENUM('time_limit', 'role_based', 'approval_required', 'concurrent_limit') NOT NULL,
    restriction_value JSON, -- Store restriction details as JSON
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Maintenance records table
CREATE TABLE maintenance_records (
    maintenance_id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT NOT NULL,
    maintenance_type ENUM('routine', 'repair', 'calibration', 'inspection') NOT NULL,
    description TEXT,
    scheduled_date DATE,
    completed_date DATE,
    technician_name VARCHAR(100),
    cost DECIMAL(10, 2),
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Notifications table
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('booking_confirmation', 'booking_reminder', 'maintenance_alert', 'approval_status', 'general') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_booking_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- User permissions table
CREATE TABLE user_permissions (
    permission_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    resource_type ENUM('room', 'equipment') NOT NULL,
    resource_id INT,
    permission_type ENUM('view', 'book', 'approve', 'manage') NOT NULL,
    granted_by INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (granted_by) REFERENCES users(user_id)
);

-- Usage analytics table
CREATE TABLE usage_analytics (
    analytics_id INT PRIMARY KEY AUTO_INCREMENT,
    resource_type ENUM('room', 'equipment') NOT NULL,
    resource_id INT NOT NULL,
    date DATE NOT NULL,
    total_bookings INT DEFAULT 0,
    total_usage_hours DECIMAL(5, 2) DEFAULT 0,
    peak_usage_hour TIME,
    utilization_rate DECIMAL(5, 2), -- Percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data

-- Sample users
INSERT INTO users (registration_number, index_number, first_name, last_name, email, role, department) VALUES
('ASP/2022/113', '5883', 'Admin', 'User', 'admin@university.edu', 'administrator', 'IT'),
('ASP/2022/139', '5921', 'John', 'Faculty', 'john.faculty@university.edu', 'faculty', 'Computer Science'),
('ASP/2022/110', '5881', 'Jane', 'Student', 'jane.student@university.edu', 'student', 'Computer Science');

-- Sample rooms
INSERT INTO rooms (room_number, room_name, room_type, capacity, location, description) VALUES
('LH-101', 'Lecture Hall 1', 'lecture_hall', 100, 'Building A, Floor 1', 'Large lecture hall with projector'),
('LAB-201', 'Computer Lab 1', 'lab', 30, 'Building B, Floor 2', 'Computer lab with 30 workstations'),
('MR-301', 'Meeting Room 1', 'meeting_room', 20, 'Building C, Floor 3', 'Conference room with video conferencing');

-- Sample equipment
INSERT INTO equipment (equipment_name, equipment_type, model, description, location) VALUES
('High-Performance Server', 'server', 'Dell PowerEdge R750', 'Server for computational research', 'Server Room A'),
('Robotic Arm', 'robotics', 'KUKA KR 6 R900', 'Industrial robotic arm for research', 'Robotics Lab'),
('3D Gloves', 'haptic', 'SenseGlove Nova', 'Haptic feedback gloves for VR research', 'VR Lab');

-- Indexes for better performance
CREATE INDEX idx_room_bookings_date ON room_bookings(booking_date);
CREATE INDEX idx_equipment_bookings_date ON equipment_bookings(booking_date);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_usage_analytics_date ON usage_analytics(date, resource_type, resource_id);