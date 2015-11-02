cd test_mobile_build
git init
git remote add origin git@github.com:garmoshka-mo/nemobile.git
git add .
git commit -m "new version"
git push origin master:mobile --force
cd ..