cd build
git remote set-url origin git@github.com:garmoshka-mo/nemobile.git
git add remote prod https://git.heroku.com/nemobile-prod.git
git add .
git commit -m "new version"
git push origin master:production
cd ..