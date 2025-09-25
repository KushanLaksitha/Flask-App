# Faculty Room & Equipment Management System

A comprehensive web-based system for managing faculty rooms, equipment, laboratories, and halls. Built with Flask and designed for educational institutions to efficiently track and manage their resources.

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-v2.3.3-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Features

### Core Functionality
- ✅ **CRUD Operations** - Create, Read, Update, Delete resources
- 🔍 **Advanced Search** - Search by name, description, location
- 🔧 **Smart Filtering** - Filter by resource type and status
- 📊 **Dashboard Analytics** - Real-time statistics and recent activity
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Real-time Validation** - Client-side form validation
- 🎨 **Modern UI** - Bootstrap 5 with custom styling

### Resource Management
- **Room Management** - Classrooms, conference rooms, study spaces
- **Equipment Tracking** - Projectors, computers, laboratory instruments
- **Laboratory Management** - Chemistry, physics, computer labs
- **Hall Management** - Auditoriums, lecture halls, seminar rooms

### Status Tracking
- 🟢 **Available** - Ready for booking/use
- 🟡 **Maintenance** - Under repair or scheduled maintenance
- 🔴 **Booked** - Currently reserved or in use

## 📸 Screenshots

### Dashboard
![img_alt](https://github.com/KushanLaksitha/Flask-App/blob/main/screenshot/dashboard.png?raw=true)

### Resource List

![img_alt](https://github.com/KushanLaksitha/Flask-App/blob/main/screenshot/all_resources.png?raw=true)

### Add/Edit Resource

![img_alt](https://github.com/KushanLaksitha/Flask-App/blob/main/screenshot/addResources.png?raw=true)

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.8+ | Backend programming language |
| **Flask** | 2.3.3 | Web framework |
| **SQLAlchemy** | 3.0.5 | Database ORM |
| **SQLite** | 3.x | Database (development) |
| **Bootstrap** | 5.3.0 | Frontend framework |
| **Font Awesome** | 6.4.0 | Icons |
| **JavaScript** | ES6+ | Client-side functionality |

## 📁 Project Structure

```
faculty_management_system/
├── 📄 app.py                    # Main Flask application
├── 📄 models.py                 # Database models
├── 📄 seed.py                   # Database seeding script
├── 📄 requirements.txt          # Python dependencies
├── 📄 README.md                 # Project documentation
├── 📁 instance/                 # SQLite database location
│   └── faculty_system.db        # SQLite database file
├── 📁 templates/               # Jinja2 HTML templates
│   ├── base.html               # Base template
│   ├── index.html              # Dashboard
│   ├── resource_list.html      # Resource listing
│   ├── resource_form.html      # Create/Edit form
│   ├── resource_detail.html    # Resource details
│   └── confirm_delete.html     # Delete confirmation
└── 📁 static/                  # Static files
    ├── 📁 css/
    │   └── custom.css          # Custom styles
    └── 📁 js/
        └── main.js             # JavaScript functionality
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Clone or download the project**
```bash
git clone <repository-url>
cd faculty_management_system
```

2. **Create virtual environment** (recommended)
```bash
python -m venv venv

# Activate virtual environment:
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Create database**
```bash
python create_db.py
```

5. **Initialize database with sample data**
```bash
python seed.py
```

6. **Run the application**
```bash
python app.py
```

7. **Open your browser and visit:**
```
http://127.0.0.1:5000
```

## 💡 Usage Guide

### Dashboard Overview
- View system statistics (total resources, available, maintenance, booked)
- See recently added resources
- Quick navigation to all features

### Managing Resources

#### Adding a New Resource
1. Click "Add Resource" in the navigation
2. Fill in the required information:
   - **Name**: Resource identifier (e.g., "Computer Lab A")
   - **Type**: room, equipment, lab, or hall
   - **Description**: Detailed description
   - **Capacity**: Number of users/items
   - **Location**: Physical location
   - **Status**: Current availability status

#### Viewing Resources
- Browse all resources in the "Resources" section
- Use the search bar to find specific resources
- Filter by type (room, equipment, lab, hall)
- Filter by status (available, maintenance, booked)

#### Editing Resources
1. Click on a resource name or "Edit" button
2. Update the information as needed
3. Click "Update Resource" to save changes

#### Deleting Resources
1. Click the "Delete" button on any resource
2. Confirm the deletion in the popup dialog
3. Resource will be permanently removed

### Search & Filter Features
- **Search**: Type keywords to find resources by name, description, or location
- **Type Filter**: Show only rooms, equipment, labs, or halls
- **Status Filter**: Show only available, maintenance, or booked resources
- **Combined Filters**: Use multiple filters together for precise results

## 🗄️ Database Schema

### Resource Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Primary key |
| `name` | String(100) | Resource name |
| `resource_type` | String(20) | Type: room/equipment/lab/hall |
| `description` | Text | Detailed description |
| `capacity` | Integer | Maximum capacity |
| `location` | String(100) | Physical location |
| `status` | String(20) | Current status |
| `created_at` | DateTime | Creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

## 🔧 Configuration

### Environment Variables
Create a `.env` file for production settings:
```env
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=sqlite:///instance/faculty_system.db
FLASK_ENV=production
```

### Database Configuration
The system uses SQLite by default. For production, you can switch to PostgreSQL or MySQL:

```python
# For PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/faculty_db'

# For MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://user:password@localhost/faculty_db'
```

## 📊 Sample Data

The system comes with 15+ pre-configured resources:

### Rooms (4)
- Computer Lab A (30 capacity)
- Conference Room B (50 capacity)
- Study Room 1 (8 capacity)
- Classroom C12 (40 capacity)

### Halls (3)
- Main Lecture Hall (200 capacity)
- Seminar Hall D (80 capacity)
- Auditorium (500 capacity)

### Equipment (6)
- Digital Projector Unit 1
- Robotic Arm Kit
- Microscope Set A (10 units)
- 3D Printer - Ultimaker S3
- Sound System Mobile Unit
- Interactive Smart Board

### Labs (3)
- Chemistry Lab 1 (25 capacity)
- Physics Lab 2 (20 capacity)
- Computer Programming Lab (25 capacity)

## 🔒 Security Features

- **Input Validation**: Server-side validation for all forms
- **CSRF Protection**: Flask's built-in CSRF protection
- **SQL Injection Prevention**: SQLAlchemy ORM protection
- **XSS Protection**: Jinja2 template auto-escaping
- **Error Handling**: Graceful error handling with user-friendly messages

## 🧪 Testing

Run the application in test mode:
```bash
# Create test instance
python -c "
from models import app, db
with app.app_context():
    db.create_all()
    print('Test database created!')
"

# Run with debug mode
python app.py
```

## 🚀 Deployment

### Development Server
```bash
python app.py
# Runs on http://127.0.0.1:5000
```

### Production Deployment

#### Using Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

#### Using Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

## 🔄 Future Enhancements

### Phase 2 Features (Roadmap)
- 👥 **User Management**: Authentication and role-based access
- 📅 **Booking System**: Time-based reservations and scheduling
- 📧 **Notifications**: Email/SMS alerts for bookings and maintenance
- 📈 **Analytics**: Usage reports and resource utilization metrics
- 📱 **Mobile App**: Native mobile application
- 🔌 **API**: RESTful API for third-party integrations
- 📊 **Advanced Reports**: PDF reports and data export
- 🔄 **Workflow Management**: Approval processes for bookings

### Technical Improvements
- **Caching**: Redis integration for performance
- **Full-text Search**: Elasticsearch integration
- **Real-time Updates**: WebSocket support
- **Multi-tenancy**: Support for multiple institutions
- **Backup System**: Automated database backups

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Code Style Guidelines
- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Add comments for complex logic
- Write docstrings for functions and classes
- Test your changes before submitting

## 🐛 Troubleshooting

### Common Issues

#### Database Errors
```bash
# Reset database
rm instance/faculty_system.db
python seed.py
```

#### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

#### Permission Issues
```bash
# Fix directory permissions
chmod 755 instance/
chmod 644 instance/faculty_system.db
```

#### Port Already in Use
```bash
# Use different port
python app.py --port 5001
```

### Getting Help
- Check the [Issues](https://github.com/KushanLaksitha/Flask-App/issues) section
- Create a new issue with:
  - Error message
  - Steps to reproduce
  - System information (OS, Python version)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Faculty Management System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👨‍💻 Authors

- **Your Name** - *Initial work* - [KushanLaksitha](https://github.com/KushanLaksitha/)

## 🙏 Acknowledgments

- Flask community for the excellent web framework
- Bootstrap team for the responsive UI components
- Font Awesome for the beautiful icons
- SQLAlchemy for the powerful ORM
- All contributors and testers

## 📞 Support

If you like this project, please give it a ⭐ on GitHub!

For support, email: kushanlaksitha32@gmail.com

---

**Happy Resource Management! 🎯**
