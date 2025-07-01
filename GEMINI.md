# MTG quiz

## Intro
- We are building a app webapp where people are presented with the artwork for a magic the gathering card and have to type the name of the card.

## rules
- use pnpm
- do not commit anything to version history without asking for permission from user.

## workflow 
Do the first incomplete task from the tasks section below.  When starting a new task create a new branch and check it out.  A completed task is [x] and incomplete task is []. Before starting a taks use context7 MCP to get the latest library information. If you are unclear about something then ask before proceeding. When you think you have finished a task prompt the user with "Task finished?". If the user replies "OK" then mark it as done in this file, commit changes and then merge the feature branch into the main branch.

### tasks 
- [x] Setup an app with a ts-react frontend and a ts-react backend. Add trpc.
- [x] Add prettier, post commit hooks using husky and eslint.
- [] Create a sample login screen for testing the login business logic. Enable login with email and password.
- [] Replace the default / page with a custom page that just says mtg quiz. Pick a color scheme that fits well with magic the gathering and add those colors to the tailwind config.
- [] Create a seed file for prisma that creates a test user.
- [] If not logged in the user is redirected to the signIn page.

- [] Create a script for seeding the dat abase. 



### Screens


### Documentation

#### Custom Authentication System
The application uses a custom authentication system based on JSON Web Tokens (JWT) for secure user management. Key features include:
- **User Registration and Login**: API endpoints at `/api/register` and `/api/login` handle user creation with password hashing (using `bcryptjs`) and token issuance.
- **Token Management**: JWTs are stored in `localStorage` on the client side and validated via middleware for protected routes.
- **Route Protection**: Middleware checks for valid JWTs in the `Authorization` header to secure specific paths.
- **Environment Configuration**: The `JWT_SECRET` in `.env.local` is used for signing tokens; ensure it's set to a secure value in production.

#### Seeding the Database
To seed the database with initial data, including a test user, follow these steps:
1. Ensure you have the seed file located at `prisma/seed.ts`. This file contains the script to create a test user.
2. Make sure the `DATABASE_URL` environment variable is set in your `.env` file or in your environment. This URL is necessary for Prisma to connect to your database. Example format for PostgreSQL:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   ```
   Replace `username`, `password`, `localhost`, `5432`, and `database_name` with your actual database credentials and connection details.
3. Run the seeding command in your terminal:
   ```
   npx prisma db seed
   ```
4. This command will execute the script defined in `package.json` under `prisma.seed`, which points to `prisma/seed.ts`. If not already configured, you may need to add the following to your `package.json`:
   ```
   "prisma": {
     "seed": "ts-node prisma/seed.ts"
   }
   ```
5. After running the command, check the console output to confirm that the test user has been created successfully.

### models 
All models should include id, created_at and updated_at

User
Create a typical user model. 
Admin bool

Quiz.
Contains several questions. (See below)
Seed, int
Compelted bool
Score int / null
User ID, fk 


Question. 
Image URL, string 
Answer string 
Quiz id, fk

Card.
Title string
Set Enum
Year int
