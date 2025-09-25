import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance', 'faculty_system.db')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.environ.get('SQLALCHEMY_ECHO', 'False').lower() == 'true'
    
    # Application Configuration
    APP_NAME = "Faculty Room & Equipment Management System"
    APP_VERSION = "1.0.0"
    APP_DESCRIPTION = "A system to manage and schedule rooms, labs, halls, and specialized equipment for educational and research purposes."
    
    # Pagination Configuration
    RESOURCES_PER_PAGE = int(os.environ.get('RESOURCES_PER_PAGE', 20))
    
    # Upload Configuration (for future file uploads)
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or \
        os.path.join(os.path.abspath(os.path.dirname(__file__)), 'static', 'uploads')
    
    # Email Configuration (for future notifications)
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
    
    # Security Configuration
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None
    
    # Session Configuration
    PERMANENT_SESSION_LIFETIME = 3600  # 1 hour in seconds
    
    # Resource Configuration
    RESOURCE_TYPES = ['room', 'lab', 'hall', 'equipment']
    RESOURCE_STATUSES = ['available', 'maintenance', 'booked']
    
    # Default Resource Limits
    MAX_CAPACITY = 1000
    MAX_NAME_LENGTH = 100
    MAX_DESCRIPTION_LENGTH = 500
    MAX_LOCATION_LENGTH = 100
    
    # Timezone Configuration
    TIMEZONE = os.environ.get('TIMEZONE', 'Asia/Colombo')
    
    @staticmethod
    def init_app(app):
        """Initialize application with this config"""
        pass


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = True
    
    # Development-specific settings
    TEMPLATES_AUTO_RELOAD = True
    EXPLAIN_TEMPLATE_LOADING = False
    
    @staticmethod
    def init_app(app):
        Config.init_app(app)
        
        # Create instance directory if it doesn't exist
        instance_dir = os.path.join(os.path.dirname(app.instance_path))
        os.makedirs(instance_dir, exist_ok=True)
        
        instance_path = os.path.dirname(app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', ''))
        os.makedirs(instance_path, exist_ok=True)


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SQLALCHEMY_ECHO = False
    
    # Use PostgreSQL in production
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance', 'faculty_system.db')
    
    # Production security settings
    SSL_REDIRECT = True
    
    @staticmethod
    def init_app(app):
        Config.init_app(app)
        
        # Log to syslog in production
        import logging
        from logging.handlers import SysLogHandler
        syslog_handler = SysLogHandler()
        syslog_handler.setLevel(logging.WARNING)
        app.logger.addHandler(syslog_handler)


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    
    # Use in-memory database for testing
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    # Disable CSRF for testing
    WTF_CSRF_ENABLED = False
    
    # Speed up password hashing for testing
    BCRYPT_LOG_ROUNDS = 1
    
    @staticmethod
    def init_app(app):
        Config.init_app(app)


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def get_config():
    """Get configuration based on environment"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])


# Utility functions for configuration
def ensure_instance_path(app):
    """Ensure instance path exists"""
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass


def create_database_path():
    """Create database directory if it doesn't exist"""
    db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance')
    os.makedirs(db_path, exist_ok=True)
    return db_path