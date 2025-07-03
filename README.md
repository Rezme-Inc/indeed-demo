### Installation

1. Clone the repository:

```bash
git clone https://github.com/Rezme-Inc/selfservice.git
cd rezme
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Reach out to Ola for these

Fill in the required environment variables in `.env.local`

4. Start the development server:

```bash
npm run dev
```

## Contributing

1. Clone the repo
2. Create your feature branch (`git checkout -b youname_feature_amazing-feature`)
3. Add you changes (`git add .`)
3. Commit your changes (`git commit -m "Add some amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Features

### User Features

- **Profile Management**: Create and manage your professional profile
- **Visibility Control**: Control who can see your profile
- **HR Connections**: Connect with HR professionals through invitation codes
- **Interest Tracking**: Add and manage your professional interests

### HR Admin Features

- **User Discovery**: Find and connect with potential candidates
- **Invitation System**: Generate and share invitation codes with users
- **Connection Management**: Maintain a list of connected users
- **Company Profile**: Manage your company's presence on the platform

### Rezme Admin Features

- **Platform Oversight**: Monitor all users and HR admins
- **User Management**: Access and manage all user profiles
- **HR Admin Management**: Oversee HR admin accounts and activities

## User Visibility System

Rezme implements a two-tier visibility system to balance user privacy with professional networking:

### Visible Users

- Users who have set their profile to be visible to HR admins (`is_visible_to_hr = true`)
- Appear in the "Visible Users" section of HR admin dashboards
- Can be discovered by any HR admin
- Users can toggle this visibility in their settings
- Think of this as a "public profile" that any HR admin can see

### Connected Users

- Users who have a direct relationship with an HR admin
- Appear in the "Connected Users" section of HR admin dashboards
- Connection is established in two ways:
  1. When a user signs up using an HR admin's invitation code
  2. When an HR admin clicks "Connect" on a visible user's profile
- This is a more direct, private relationship between the HR admin and the user
- Think of this as a "private connection" between the HR admin and the user

## Documentation

For detailed technical documentation, please refer to the following:

- [Database Schema](docs/database.md) - Database structure and relationships
- [API Documentation](docs/api.md) - API endpoints and usage
- [Security](docs/security.md) - Security measures and best practices

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/rezme.git
cd rezme
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Fill in the required environment variables in `.env.local`

4. Start the development server:

```bash
npm run dev
```

### Database Setup

1. Create a new Supabase project
2. Run the migrations:

```bash
npm run supabase:db:reset
```

## User Types

### Regular Users

- Can create and manage their profile
- Control their visibility to HR admins
- Connect with HR admins through invitation codes
- Add and manage professional interests

### HR Admins

- Can generate and share invitation codes
- View and connect with visible users
- Manage their connected users
- Set up and manage their company profile

### Rezme Admins

- Have full access to all platform features
- Can manage all user types
- Monitor platform activity
- Handle administrative tasks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
