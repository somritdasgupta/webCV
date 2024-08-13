<p align="center">
  <a href="https://somrit.vercel.app">
    <img src="https://i.ibb.co/tZsv6Br/avatar-1.png" alt="Avatar" border="0">
  </a>
</p>

## Introduction

This is my website built using [Next.js](https://nextjs.org/) and styled with [Tailwind CSS](https://tailwindcss.com/). It acts as a preview of my projects and blogs. The site is designed to be responsive, intuitive, minimal and optimized for light and dark modes.

## Features

- **Responsive Design:** The site is fully responsive and looks great on desktops, tablets, and mobile devices.
- **Dark/Light Mode:** Users can toggle between dark and light modes for a personalized experience.
- **Projects Display:** Features a section showcasing various projects with details and links.
- **Skills Section:** Highlights technical skills with a modern UI.
- **Resume Download:** Allows users to download a PDF version of my resume.
- **Blog Integration:** Displays blog posts fetched from an external API.

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Serverless functions (for fetching GitHub repositories)
- **Deployment:** Vercel

## Installation

To get started with this project locally, follow these steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/your-repository.git
   ```

2. **Navigate to the Project Directory:**

   ```bash
   cd your-repository
   ```

3. **Install Dependencies:**

   ```bash
   pnpm install
   ```

4. **Run the Development Server:**

   ```bash
   pnpm dev
   ```

   Open your browser and go to `http://localhost:3000` to view the website.

## Usage

- **Viewing the Website:** After running the development server, you can view your website in your browser at `http://localhost:3000`.
- **Building for Production:** To build the website for production, run:

  ```bash
  pnpm build
  ```

  The production build will be created in the `.next` directory.

## Customization

- **Update Content:** Modify the content in the `app` directory, especially in `app/page.tsx` and `app/components`.
- **Update Styling:** Adjust the styles in `styles/globals.css` and use Tailwind CSS classes for customizations.
- **Resume:** Replace the `public/Resume.pdf` file with your updated resume file and update the `Get Resume` button link if necessary.
- **Favicon:** Update the `public/favicon.png` file to use your own favicon.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
