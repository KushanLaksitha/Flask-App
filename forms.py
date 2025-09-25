"""
Form validation for Faculty Room & Equipment Management System
This file provides form classes for better validation and rendering
Optional for lite version - can use basic request.form validation instead
"""

from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField, IntegerField, SubmitField
from wtforms.validators import DataRequired, Length, Optional, NumberRange
from models import Resource

class ResourceForm(FlaskForm):
    """Form for creating and editing resources"""
    
    name = StringField(
        'Resource Name', 
        validators=[
            DataRequired(message='Resource name is required.'),
            Length(min=2, max=100, message='Name must be between 2 and 100 characters.')
        ],
        render_kw={
            'class': 'form-control',
            'placeholder': 'Enter resource name (e.g., Computer Lab A, Robotic Arm Unit 1)'
        }
    )
    
    resource_type = SelectField(
        'Resource Type',
        choices=[
            ('', 'Select resource type...'),
            ('room', 'Room'),
            ('lab', 'Laboratory'),
            ('hall', 'Hall'),
            ('equipment', 'Equipment')
        ],
        validators=[DataRequired(message='Please select a resource type.')],
        render_kw={'class': 'form-control'}
    )
    
    description = TextAreaField(
        'Description',
        validators=[
            Optional(),
            Length(max=500, message='Description cannot exceed 500 characters.')
        ],
        render_kw={
            'class': 'form-control',
            'rows': 4,
            'placeholder': 'Describe the resource, its features, and any special requirements...'
        }
    )
    
    capacity = IntegerField(
        'Capacity',
        validators=[
            Optional(),
            NumberRange(min=0, max=1000, message='Capacity must be between 0 and 1000.')
        ],
        render_kw={
            'class': 'form-control',
            'placeholder': 'For rooms: seating capacity, For equipment: usage limit',
            'min': '0',
            'max': '1000'
        }
    )
    
    location = StringField(
        'Location',
        validators=[
            DataRequired(message='Location is required.'),
            Length(min=2, max=100, message='Location must be between 2 and 100 characters.')
        ],
        render_kw={
            'class': 'form-control',
            'placeholder': 'Building name, floor, room number (e.g., Engineering Building, Floor 3, Room 301)'
        }
    )
    
    status = SelectField(
        'Status',
        choices=[
            ('available', 'Available'),
            ('maintenance', 'Under Maintenance'),
            ('booked', 'Booked/Occupied')
        ],
        validators=[DataRequired(message='Please select a status.')],
        default='available',
        render_kw={'class': 'form-control'}
    )
    
    specifications = TextAreaField(
        'Technical Specifications',
        validators=[
            Optional(),
            Length(max=1000, message='Specifications cannot exceed 1000 characters.')
        ],
        render_kw={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'Technical details, software installed, hardware specs, etc. (Optional)'
        }
    )
    
    maintenance_notes = TextAreaField(
        'Maintenance Notes',
        validators=[
            Optional(),
            Length(max=500, message='Maintenance notes cannot exceed 500 characters.')
        ],
        render_kw={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'Any maintenance information or special notes (Optional)'
        }
    )
    
    submit = SubmitField(
        'Save Resource',
        render_kw={'class': 'btn btn-primary'}
    )
    
    def validate_name(self, field):
        """Custom validation to check for duplicate names"""
        # This will be called automatically by WTForms
        # Skip validation if this is an edit form and name hasn't changed
        if hasattr(self, '_resource_id'):
            existing = Resource.query.filter(
                Resource.name == field.data,
                Resource.id != self._resource_id
            ).first()
        else:
            existing = Resource.query.filter_by(name=field.data).first()
            
        if existing:
            raise ValidationError('A resource with this name already exists.')


class SearchForm(FlaskForm):
    """Form for searching and filtering resources"""
    
    search = StringField(
        'Search',
        validators=[Optional()],
        render_kw={
            'class': 'form-control',
            'placeholder': 'Search by name, description, or location...'
        }
    )
    
    resource_type = SelectField(
        'Type',
        choices=[('', 'All Types')],  # Will be populated dynamically
        validators=[Optional()],
        render_kw={'class': 'form-control'}
    )
    
    status = SelectField(
        'Status', 
        choices=[('', 'All Status')],  # Will be populated dynamically
        validators=[Optional()],
        render_kw={'class': 'form-control'}
    )
    
    submit = SubmitField(
        'Search',
        render_kw={'class': 'btn btn-outline-primary'}
    )
    
    def __init__(self, *args, **kwargs):
        super(SearchForm, self).__init__(*args, **kwargs)
        
        # Populate resource type choices dynamically
        try:
            resource_types = Resource.get_resource_types()
            self.resource_type.choices = [('', 'All Types')] + [
                (rtype, rtype.title()) for rtype in resource_types
            ]
        except:
            # Handle case when database is not initialized yet
            pass
        
        # Populate status choices dynamically  
        try:
            statuses = Resource.get_resource_statuses()
            self.status.choices = [('', 'All Status')] + [
                (status, status.title()) for status in statuses
            ]
        except:
            # Handle case when database is not initialized yet
            self.status.choices = [
                ('', 'All Status'),
                ('available', 'Available'),
                ('maintenance', 'Under Maintenance'),
                ('booked', 'Booked/Occupied')
            ]


class DeleteConfirmForm(FlaskForm):
    """Simple form for delete confirmation"""
    
    confirm = SubmitField(
        'Yes, Delete Resource',
        render_kw={'class': 'btn btn-danger'}
    )
    
    cancel = SubmitField(
        'Cancel',
        render_kw={'class': 'btn btn-secondary'}
    )


# Utility functions for form handling
def validate_resource_form_data(form_data, resource_id=None):
    """
    Validate resource form data manually (alternative to WTForms)
    Used when not using FlaskForm classes
    """
    errors = []
    
    # Required field validation
    name = form_data.get('name', '').strip()
    if not name:
        errors.append('Resource name is required.')
    elif len(name) < 2 or len(name) > 100:
        errors.append('Name must be between 2 and 100 characters.')
    
    resource_type = form_data.get('resource_type', '').strip()
    if not resource_type:
        errors.append('Resource type is required.')
    elif resource_type not in ['room', 'lab', 'hall', 'equipment']:
        errors.append('Invalid resource type selected.')
    
    location = form_data.get('location', '').strip()
    if not location:
        errors.append('Location is required.')
    elif len(location) < 2 or len(location) > 100:
        errors.append('Location must be between 2 and 100 characters.')
    
    # Optional field validation
    capacity = form_data.get('capacity', type=int)
    if capacity is not None and (capacity < 0 or capacity > 1000):
        errors.append('Capacity must be between 0 and 1000.')
    
    description = form_data.get('description', '').strip()
    if description and len(description) > 500:
        errors.append('Description cannot exceed 500 characters.')
    
    specifications = form_data.get('specifications', '').strip()
    if specifications and len(specifications) > 1000:
        errors.append('Specifications cannot exceed 1000 characters.')
    
    maintenance_notes = form_data.get('maintenance_notes', '').strip()
    if maintenance_notes and len(maintenance_notes) > 500:
        errors.append('Maintenance notes cannot exceed 500 characters.')
    
    status = form_data.get('status', 'available')
    if status not in ['available', 'maintenance', 'booked']:
        errors.append('Invalid status selected.')
    
    # Check for duplicate names
    if name:
        if resource_id:
            # Editing existing resource
            existing = Resource.query.filter(
                Resource.name == name,
                Resource.id != resource_id
            ).first()
        else:
            # Creating new resource
            existing = Resource.query.filter_by(name=name).first()
            
        if existing:
            errors.append('A resource with this name already exists.')
    
    return errors


def get_form_choices():
    """Get choices for form dropdowns"""
    return {
        'resource_types': [
            ('room', 'Room'),
            ('lab', 'Laboratory'), 
            ('hall', 'Hall'),
            ('equipment', 'Equipment')
        ],
        'statuses': [
            ('available', 'Available'),
            ('maintenance', 'Under Maintenance'),
            ('booked', 'Booked/Occupied')
        ]
    }