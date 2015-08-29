cd build
git add remote origin git@github.com:garmoshka-mo/nepotom.git
git add remote prod https://git.heroku.com/nemobile-prod.git
git add .
git commit -m "new version"
git push origin master:production
