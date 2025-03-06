# Prompt & Response App
## Made by Owen Read
A collaborative writing platform for creating prompts, sharing ideas, and collaborating with response in a rich text environment.
[Use the App Now](https://bidscript-prompt.vercel.app/)

## Features
- **User Authentication:** Share creative writing prompts with the community
- **Create Prompts:** Share creative writing prompts with the community
- **Categorization:** Organize prompts with custom categories
- **Rich Text Repsonse:** Respond to prompts with a powerful rich text editor
- **Real-Time Updates:** See new responses as they are posted
- **Infinite Scrolling:** Browse through prompts and responses with seamless loading
- **Dark/Light Mode:** Choose your preferred theme
- **Mobile Responsiveness:** Full functionality across devices

## Technologies Used
- **Frontend:** Next.js 14, React, Typescript
- **Authentication & Database:** Supabase
- **UI Components:** Shadcn/ui, Tailwind CSS
- **Rich Text Editor:** Lexical
- **Animations:** Framer Motion
- **Styling:** Tailwind CSS with CSS Variables for theming
- **State Management:** React hooks and Context

## Installation
1. Clone the repository:
```
git clone https://github.com/yourusername/prompt-and-response.git
cd prompt-and-response
```
2. Install Dependencies:
```
npm install
# or
yarn install
# or
pnpm install
```
3. Set up environment variables: Create a ```.env.local``` in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
4. Set up Supabase:
    -  Create a new project on supabase
    -  Set up the following tables in your supabase database:
        - ```Prompts``` (id, title, prompt, author, created_at, categories)
        - ```Responses``` (id, prompt_id, content, author, created_at)
        - ```Profiles``` (id, username, email, created_at)
    - Set up authentication in supabase
5. Run the development server:
```
npm run dev
# or
yarn dev
# or
pnpm dev
```
6. Open http://localhost:3000

## Database Schema
### Profiles Table
- ```id```: UUID (references auth.users.id)
- ```username```: String
- ```email```: String
- ```created_at```: Timestamp

### Prompts Table
- ```id```: UUID (primary key)
- ```title```: String
- ```prompt```: Text
- ```author```: String (references profiles.username)
- ```created_at```: Timestamp
- ```categories```: String[] (array)

### Responses Table
- ```id```: UUID (primary key)
- ```prompt_id```: UUID (references prompts.id)
- ```content```: JSON (for rich text content)
- ```author```: String (references profiles.username)
- ```created_at```: Timestamp

## User Guide
### Authentication
- Register using the sign-up page
- Log in with your credentials
- Authenticated users can create prompts and responses

### Creating Prompts
1. Navigate to the "Prompts" page
2. Click the "Create Prompt" button
3. Fill in the title and prompt content
4. Add categories (optional)
5. Submit your prompt

### Browsing and Filtering Prompts
- All prompts are displayed on the main prompts page
- Filter prompts by categories using the search bar
- Click on a prompt to view its details and responses

### Creating Responses
1. Navigate to a specific prompt
2. Use the rich text editor to craft your response
3. Format text using the toolbar (bold, italic, lists, headings, etc.)
4. Submit your response

### Rich Text Editor Features
- Text formatting (bold, italic, underline, strikethrough)
- Headings (H1, H2, H3)
- Lists (ordered and unordered)
- Tables
- Indentation
- Images
- Undo/redo

## Project Structure
```
├── public/               # Static files
├── src/
│   ├── app/              # Next.js app router
│   │   ├── (auth)/       # Protected routes
│   │   ├── api/          # API routes
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   ├── components/       # React components
│   │   ├── ui/           # UI components from shadcn/ui
│   ├── lib/              # Utility libraries
│   ├── plugins/          # Lexical editor plugins
│   ├── themes/           # Theming
│   ├── utils/            # Utility functions
│       ├── supabase/     # Supabase client utilities
├── middleware.ts         # Next.js middleware
├── next.config.ts        # Next.js configuration
```

# Key Design & Technical Decisions
## Authentication & Authorization
- Used Supabase Auth for user authentication with middleware protection for routes
- Created a custom profiles table to store additional user information beyond the default auth schema
- Implemented protected routes using a Next.js middleware approach to ensure security

## Database Design
- Structured the database with clear relationships between prompts and responses
- Used cascading deletes to ensure that when a prompt is deleted, all associated responses are automatically removed
- Implemented categories as an array type in the prompts table for efficient filtering

## Real-time Updates
- Leveraged Supabase's real-time capabilities for instant response updates
- Implemented a channel-based subscription system to efficiently push new responses to clients
- Used optimistic UI updates for better user experience

## Rich Text Editor
- Built custom plugins and toolbar components for a tailored editing experience
- Implemented a shared theme for consistent styling between editor and viewer

## Frontend Architecture
- Implemented infinite scrolling for both prompts and responses to handle large datasets efficiently
- Created reusable components for categories and common UI elements

# Areas for Improvement
**With more time, the following improvements would be prioritized:**

## Editor Enhancements
- Plugin Synchronization: Refactor the response creator and viewer components to share a common plugin system, ensuring that plugins added to one component are automatically available in the other
- Image Handling: Fix the current image plugin implementation which adds a paragraph space to bypass the isEmpty check; implement a proper solution for checking emptiness that accounts for images
- Image Persistence: Implement a storage solution for images used in responses so they persist when the page is refreshed, rather than showing alt text

## User Experience
- Implement a rating or upvote system for responses

## Development
### Custom UI Components
The project uses shadcn/ui components which can be customized in the ```src/components/ui``` directory.

### Theme Customization
Modify the theme variables in ```src/app/globals.css``` to change the application's appearance.

### Editor Customization
The Lexical editor can be customized by modifying the plugins in the ```src/plugins``` directory.

## Acknowledgements
Created by Owen Read.













