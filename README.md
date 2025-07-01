# Expiry Deals Backend

Expiry Deals Backend is a robust Node.js/TypeScript RESTful API server designed for managing an e-commerce platform focused on expiring deals, vendor management, payments, notifications, and user authentication. The backend is built with scalability, maintainability, and security in mind, leveraging modern best practices and a modular architecture.

---



## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [API Modules](#api-modules)
- [Email Templates](#email-templates)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- User, Vendor, and Admin authentication and authorization
- Vendor request and approval workflow
- Product and order management
- Payment processing and withdrawal requests
- Notification system
- File uploads (local and AWS S3)
- Email notifications (OTP, password reset, vendor status)
- Dashboard analytics for admin and vendors
- Modular, scalable codebase with TypeScript

---

## Project Structure

```
.
├── src/                        # Main source code
│   ├── app/
│   │   ├── class/              # Utility and service classes (e.g., Stripe, QueryBuilder)
│   │   ├── config/             # Configuration files
│   │   ├── constants/          # Application constants
│   │   ├── error/              # Custom error handling
│   │   ├── helpers/            # Helper functions
│   │   ├── interface/          # Shared TypeScript interfaces
│   │   ├── middleware/         # Express middlewares
│   │   └── modules/            # Main business modules (users, payments, vendors, etc.)
│   ├── app.ts                  # Express app setup
│   ├── server.ts               # Server entry point
│   └── socket.ts               # Socket.io setup
├── public/
│   ├── uploads/                # Uploaded files (profile images, etc.)
│   └── view/                   # HTML email templates
├── .env                        # Environment variables
├── package.json                # Project metadata and scripts
├── tsconfig.json               # TypeScript configuration
├── generateFolder.ts           # Code generator for new modules
└── ...                         # Other config and dotfiles
```

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MongoDB instance
- AWS S3 bucket (for file uploads)
- Stripe account (for payments)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/mdnazmulhasanniloy/expiry-deals-backend.git
   cd expiry-deals-backend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   - Copy `example.env` to `.env` and fill in the required values.

4. **Run the development server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```

---

## Environment Variables

All sensitive configuration is managed via environment variables. See [`example.env`](example.env) for required keys, including:

- Database connection string
- JWT secrets and expiry
- AWS S3 credentials
- Stripe API keys
- Email SMTP credentials

---

## Scripts

- `npm run dev` — Start the server in development mode with hot reload
- `npm run build` — Compile TypeScript to JavaScript
- `npm start` — Start the compiled server
- `npm run lint` — Run ESLint
- `npm run test` — Run tests (if implemented)

---

## API Modules

The backend is organized into modules under [`src/app/modules`](src/app/modules):

- **User Management:** Registration, login, profile, roles
- **Vendor Requests:** Vendor onboarding, approval, rejection
- **Payments:** Payment processing, Stripe integration, earnings analytics
- **Withdraw Requests:** Vendor withdrawal workflow
- **Products & Orders:** Product CRUD, order management
- **Notifications:** In-app and email notifications
- **Contents:** Static content (About Us, Terms, etc.)
- **Bank Details:** Vendor bank information

Each module follows a standard structure: controller, service, model, interface, route, validation.

---

## Email Templates

HTML templates for transactional emails are located in [`public/view`](public/view):

- `otp_mail.html` — OTP verification
- `forgot_pass_mail.html` — Password reset
- `vendor_account_created.html` — Vendor approval
- `reject_vendor_request.html` — Vendor rejection

---

## Testing

- Unit and integration tests can be added under a `tests/` directory.
- The project is compatible with Jest or Mocha for testing.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

---

## License

This project is licensed under the MIT License.

---

## Contact

For support or inquiries, please contact [support@yourcompany.com](mailto:support@yourcompany.com).
