template-gulp-angular-sass
==============

A simple template for creating a single page application. Builds down to a single css, js, and html file.

## Getting Started

1. Clone Repo
2. Inside directory run `npm install` to install all gulp modules
3. Inside a command prompt `gulp watch` to launch the app

## Gulp Commands

- `gulp watch` start server and compile on changes to files. LiveReload is included in the gulp file. Just grab the LiveReload extension for your browser and turn it on when you want LiveReload active.
- `gulp build` merges and minifies html, js, and css files and moves images and fonts to `dist` directory.

### Notes

- `angular-mocks` is include for development against a mocked backend, a small example is include.
- Injection from separate files in the `injects` folder replace sections of the `index.html` file on build. This is helpful for keeping distinct dev and production settings.