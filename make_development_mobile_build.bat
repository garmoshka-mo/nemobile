xcopy www test_mobile_build /E /Y /I
gulp make_mobile_test_build
cd test_mobile_build
git init