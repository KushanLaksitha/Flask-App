from flask import Flask, render_template, request, redirect, url_for, flash
from models import app, db, Resource
from datetime import datetime
import os

# Create instance directory if it doesn't exist
instance_dir = os.path.join(os.path.dirname(__file__), 'instance')
if not os.path.exists(instance_dir):
    os.makedirs(instance_dir)

# Create database tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def index():
    """Home page with system overview"""
    try:
        total_resources = Resource.query.count()
        available_resources = Resource.query.filter_by(status='available').count()
        maintenance_resources = Resource.query.filter_by(status='maintenance').count()
        booked_resources = Resource.query.filter_by(status='booked').count()
        
        recent_resources = Resource.query.order_by(Resource.created_at.desc()).limit(5).all()
        
        stats = {
            'total': total_resources,
            'available': available_resources,
            'maintenance': maintenance_resources,
            'booked': booked_resources
        }
        
        return render_template('index.html', stats=stats, recent_resources=recent_resources)
    except Exception as e:
        flash(f'Error loading dashboard: {str(e)}', 'error')
        return render_template('index.html', stats={'total': 0, 'available': 0, 'maintenance': 0, 'booked': 0}, recent_resources=[])

@app.route('/resources')
def resource_list():
    """List all resources with search and filter"""
    try:
        # Get query parameters
        search = request.args.get('search', '').strip()
        resource_type = request.args.get('type', '')
        status = request.args.get('status', '')
        
        # Build query
        query = Resource.query
        
        # Apply filters
        if search:
            query = query.filter(
                db.or_(
                    Resource.name.contains(search),
                    Resource.description.contains(search),
                    Resource.location.contains(search)
                )
            )
        
        if resource_type:
            query = query.filter_by(resource_type=resource_type)
            
        if status:
            query = query.filter_by(status=status)
        
        # Order by name
        resources = query.order_by(Resource.name).all()
        
        # Get unique types and statuses for filters
        all_types = db.session.query(Resource.resource_type.distinct()).all()
        all_statuses = db.session.query(Resource.status.distinct()).all()
        
        types = [t[0] for t in all_types]
        statuses = [s[0] for s in all_statuses]
        
        return render_template('resource_list.html', 
                             resources=resources, 
                             search=search,
                             selected_type=resource_type,
                             selected_status=status,
                             types=types,
                             statuses=statuses)
    
    except Exception as e:
        flash(f'Error loading resources: {str(e)}', 'error')
        return render_template('resource_list.html', resources=[], types=[], statuses=[])

@app.route('/resources/create', methods=['GET', 'POST'])
def resource_create():
    """Create new resource"""
    if request.method == 'POST':
        try:
            # Get form data
            name = request.form.get('name', '').strip()
            resource_type = request.form.get('resource_type', '').strip()
            description = request.form.get('description', '').strip()
            capacity = request.form.get('capacity', type=int)
            location = request.form.get('location', '').strip()
            status = request.form.get('status', 'available').strip()
            
            # Validation
            if not name:
                flash('Resource name is required', 'error')
                return render_template('resource_form.html')
            
            if not resource_type:
                flash('Resource type is required', 'error')
                return render_template('resource_form.html')
            
            # Create resource
            resource = Resource(
                name=name,
                resource_type=resource_type,
                description=description,
                capacity=capacity,
                location=location,
                status=status
            )
            
            db.session.add(resource)
            db.session.commit()
            
            flash(f'Resource "{name}" created successfully!', 'success')
            return redirect(url_for('resource_detail', id=resource.id))
        
        except Exception as e:
            db.session.rollback()
            flash(f'Error creating resource: {str(e)}', 'error')
            return render_template('resource_form.html')
    
    return render_template('resource_form.html', resource=None)

@app.route('/resources/<int:id>')
def resource_detail(id):
    """View single resource details"""
    try:
        resource = Resource.query.get_or_404(id)
        return render_template('resource_detail.html', resource=resource)
    except Exception as e:
        flash(f'Error loading resource: {str(e)}', 'error')
        return redirect(url_for('resource_list'))

@app.route('/resources/<int:id>/edit', methods=['GET', 'POST'])
def resource_edit(id):
    """Edit existing resource"""
    try:
        resource = Resource.query.get_or_404(id)
        
        if request.method == 'POST':
            # Get form data
            name = request.form.get('name', '').strip()
            resource_type = request.form.get('resource_type', '').strip()
            description = request.form.get('description', '').strip()
            capacity = request.form.get('capacity', type=int)
            location = request.form.get('location', '').strip()
            status = request.form.get('status', 'available').strip()
            
            # Validation
            if not name:
                flash('Resource name is required', 'error')
                return render_template('resource_form.html', resource=resource)
            
            if not resource_type:
                flash('Resource type is required', 'error')
                return render_template('resource_form.html', resource=resource)
            
            # Update resource
            resource.name = name
            resource.resource_type = resource_type
            resource.description = description
            resource.capacity = capacity
            resource.location = location
            resource.status = status
            resource.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            flash(f'Resource "{name}" updated successfully!', 'success')
            return redirect(url_for('resource_detail', id=resource.id))
        
        return render_template('resource_form.html', resource=resource)
    
    except Exception as e:
        db.session.rollback()
        flash(f'Error updating resource: {str(e)}', 'error')
        return redirect(url_for('resource_list'))

@app.route('/resources/<int:id>/delete', methods=['GET', 'POST'])
def resource_delete(id):
    """Delete resource with confirmation"""
    try:
        resource = Resource.query.get_or_404(id)
        
        if request.method == 'POST':
            resource_name = resource.name
            db.session.delete(resource)
            db.session.commit()
            
            flash(f'Resource "{resource_name}" deleted successfully!', 'success')
            return redirect(url_for('resource_list'))
        
        return render_template('confirm_delete.html', resource=resource)
    
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting resource: {str(e)}', 'error')
        return redirect(url_for('resource_list'))

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500

if __name__ == '__main__':
    # Development server
    app.run(debug=True, host='127.0.0.1', port=5000)