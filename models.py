from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

# Create Flask app
app = Flask(__name__)

# Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "instance", "faculty_system.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'faculty-management-secret-key-2024'

# Initialize database
db = SQLAlchemy(app)

# Resource Model
class Resource(db.Model):
    __tablename__ = 'resources'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(20), nullable=False)  # room, equipment, lab, hall
    description = db.Column(db.Text)
    capacity = db.Column(db.Integer)
    location = db.Column(db.String(100))
    status = db.Column(db.String(20), default='available')  # available, maintenance, booked
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Resource {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'resource_type': self.resource_type,
            'description': self.description,
            'capacity': self.capacity,
            'location': self.location,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }