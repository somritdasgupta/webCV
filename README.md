<p align="center">
  <a href="https://somrit.vercel.app">
    <img src="https://i.ibb.co/tZsv6Br/avatar-1.png" alt="Avatar" border="0">
  </a>
</p>

## Introduction

This is my website built using [Next.js](https://nextjs.org/) and styled with [Tailwind CSS](https://tailwindcss.com/). It acts as a frontend of my projects and blog posts. The site is designed to be responsive, intuitive, minimal and optimized for light and dark modes.

## Tech Stack

- **Framework:** Next.js
- **Styling:** Tailwind CSS
- **Backend:** Serverless functions
- **Deployment:** Vercel
- **Analytics:** Vercel Analytics
- **CMS:** Version Control System (Git)

## Installation

To get started with this project locally, follow these steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/somritdasgupta/webCV.git
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

- **Building for Production:** To build the website for production, run:

  ```bash
  pnpm build
  ```

  The production build will be created in the `.next` directory.

## Customization

- **Update Content:** Modify the content in the `app` directory, especially in `app/page.tsx` and `app/components`.
- **Update Styling:** Adjust the styles in `app/global.css` and use Tailwind CSS classes for customizations.
- **Resume:** Replace the `public/Resume.pdf` file with your updated resume file and update the `Get Resume` button link if necessary.
- **Favicon:** Update the `public/favicon.png` file to use your own favicon.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
