#!/usr/bin/env python3
"""
Database Seeding Script for Faculty Management System
"""

from models import app, db, Resource
from datetime import datetime

def seed_database():
    """Seed database with sample data"""
    
    with app.app_context():
        print("Seeding Faculty Management System Database...")
        
        # Clear existing data (optional)
        print("Clearing existing data...")
        Resource.query.delete()
        db.session.commit()
        
        # Sample resources data
        sample_resources = [
            # Rooms
            {
                'name': 'Computer Lab A',
                'resource_type': 'room',
                'description': 'Main computer laboratory with 30 workstations, projector, and interactive whiteboard. Equipped with latest software for programming and design.',
                'capacity': 30,
                'location': 'Building A, Floor 2, Room 201',
                'status': 'available'
            },
            {
                'name': 'Conference Room B',
                'resource_type': 'room',
                'description': 'Large conference room with video conferencing facilities, presentation screen, and comfortable seating.',
                'capacity': 50,
                'location': 'Building A, Floor 1, Room 105',
                'status': 'available'
            },
            {
                'name': 'Study Room 1',
                'resource_type': 'room',
                'description': 'Small study room ideal for group discussions, team meetings, and collaborative work.',
                'capacity': 8,
                'location': 'Library Building, Floor 2, Room 205',
                'status': 'booked'
            },
            {
                'name': 'Classroom C12',
                'resource_type': 'room',
                'description': 'Standard classroom with multimedia setup, comfortable seating, and air conditioning.',
                'capacity': 40,
                'location': 'Building C, Floor 1, Room 12',
                'status': 'available'
            },
            
            # Halls
            {
                'name': 'Main Lecture Hall',
                'resource_type': 'hall',
                'description': 'Large lecture hall with tiered seating, professional audio-visual equipment, and 200 capacity.',
                'capacity': 200,
                'location': 'Building B, Ground Floor',
                'status': 'available'
            },
            {
                'name': 'Seminar Hall D',
                'resource_type': 'hall',
                'description': 'Modern seminar hall with smart board, wireless presentation system, and excellent acoustics.',
                'capacity': 80,
                'location': 'Building C, Floor 1',
                'status': 'maintenance'
            },
            {
                'name': 'Auditorium',
                'resource_type': 'hall',
                'description': 'Main auditorium for large events, presentations, and ceremonies. Features professional lighting and sound.',
                'capacity': 500,
                'location': 'Main Building, Ground Floor',
                'status': 'available'
            },
            
            # Equipment
            {
                'name': 'Digital Projector Unit 1',
                'resource_type': 'equipment',
                'description': 'High-resolution 4K digital projector with HDMI, USB, and wireless connectivity options.',
                'capacity': 1,
                'location': 'AV Equipment Storage Room',
                'status': 'available'
            },
            {
                'name': 'Robotic Arm Kit',
                'resource_type': 'equipment',
                'description': '6-axis industrial robotic arm for engineering demonstrations, research projects, and educational purposes.',
                'capacity': 1,
                'location': 'Engineering Lab, Building D, Room 301',
                'status': 'available'
            },
            {
                'name': 'Microscope Set A',
                'resource_type': 'equipment',
                'description': 'Professional microscope set with 10 compound microscopes for biology and chemistry laboratories.',
                'capacity': 10,
                'location': 'Biology Lab, Building E, Floor 2',
                'status': 'available'
            },
            {
                'name': '3D Printer - Ultimaker S3',
                'resource_type': 'equipment',
                'description': 'Professional 3D printer for rapid prototyping, research projects, and educational demonstrations.',
                'capacity': 1,
                'location': 'Maker Space, Building F, Room 105',
                'status': 'maintenance'
            },
            {
                'name': 'Sound System Mobile Unit',
                'resource_type': 'equipment',
                'description': 'Portable professional sound system with wireless microphones, speakers, and mixing console.',
                'capacity': 1,
                'location': 'AV Storage Room',
                'status': 'booked'
            },
            {
                'name': 'Interactive Smart Board',
                'resource_type': 'equipment',
                'description': '75-inch interactive smart board with touch capability and built-in computing unit.',
                'capacity': 1,
                'location': 'Education Technology Center',
                'status': 'available'
            },
            
            # Labs
            {
                'name': 'Chemistry Lab 1',
                'resource_type': 'lab',
                'description': 'Fully equipped chemistry laboratory with fume hoods, safety equipment, and chemical storage.',
                'capacity': 25,
                'location': 'Science Building, Floor 3, Room 301',
                'status': 'available'
            },
            {
                'name': 'Physics Lab 2',
                'resource_type': 'lab',
                'description': 'Advanced physics laboratory with optical bench, electronic equipment, and measurement instruments.',
                'capacity': 20,
                'location': 'Science Building, Floor 2, Room 205',
                'status': 'available'
            },
            {
                'name': 'Computer Programming Lab',
                'resource_type': 'lab',
                'description': 'Specialized programming lab with 25 high-performance computers and development software.',
                'capacity': 25,
                'location': 'IT Building, Floor 1, Room 110',
                'status': 'available'
            }
        ]
        
        # Create and add resources
        print(f"Adding {len(sample_resources)} sample resources...")
        for resource_data in sample_resources:
            resource = Resource(**resource_data)
            db.session.add(resource)
        
        # Commit all changes
        db.session.commit()
        print(f"✅ Successfully added {len(sample_resources)} resources to the database!")
        
        # Verify data
        total_resources = Resource.query.count()
        print(f"📊 Total resources in database: {total_resources}")
        
        # Show breakdown by type
        resource_types = db.session.query(Resource.resource_type, db.func.count(Resource.id)).group_by(Resource.resource_type).all()
        print("\n📋 Resources by type:")
        for resource_type, count in resource_types:
            print(f"  {resource_type.title()}: {count}")
        
        # Show breakdown by status
        statuses = db.session.query(Resource.status, db.func.count(Resource.id)).group_by(Resource.status).all()
        print("\n🏷️  Resources by status:")
        for status, count in statuses:
            print(f"  {status.title()}: {count}")

if __name__ == '__main__':
    seed_database()