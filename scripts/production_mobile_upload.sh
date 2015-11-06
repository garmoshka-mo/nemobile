cd prod_mobile_build/www
git init
git remote add origin git@github.com:garmoshka-mo/nemobile.git
git add .
git commit -m "new version"
git push origin master:mobile-release --force
cd ../..