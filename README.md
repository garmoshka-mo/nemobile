## Deploy dev-environment

1. Setup vagrant: https://www.vagrantup.com/downloads
2. Setup virtualbox: https://www.virtualbox.org/wiki/Downloads
3. Then run: `vagrant_initialize.sh`

## Development

1. Enter to virtual machine: `start_vagrant.sh`
2. Run http server:
````
cd n<Tab>, <Enter>
npm start
````
Goto http://localhost:8080/

## Build for *prod*

Run `gulp`
It will build project to sub-folder `build/`
This sub-folder should be committed to production repo

