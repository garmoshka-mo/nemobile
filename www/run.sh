# 1. npm install -g browser-sync
# 2. В папке www в командной строке выполнить 
# browser-sync start --files "css/*.css, *.html, js/*.js, templates/*.html" --server

browser-sync start --port 8000 --no-ghost-mode --files "css/*.css, *.html, js/*.js, templates/*.html" --server
