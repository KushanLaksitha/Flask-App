#!/usr/bin/env python3
"""
Database Creation Script for Faculty Management System
Run this script to create the database and tables.
"""

import os
from models import app, db, Resource

def create_database():
    """Create database and tables"""
    
    # Create instance directory if it doesn't exist
    instance_dir = os.path.join(os.path.dirname(__file__), 'instance')
    if not os.path.exists(instance_dir):
        os.makedirs(instance_dir)
        print(f"Created directory: {instance_dir}")
    
    # Create database and tables
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")
        
        # Check if tables exist
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"Tables created: {tables}")

if __name__ == '__main__':
    create_database()