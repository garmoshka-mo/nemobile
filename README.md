```
npm install
npm start
````
Goto http://localhost:8080/

# Advanced

## Deploy isolated dev-environment with Vagrant

1. Setup vagrant: https://www.vagrantup.com/downloads
1. Setup virtualbox: https://www.virtualbox.org/wiki/Downloads
1. Then run: `vagrant_initialize.sh`
1. Enter to virtual machine: `start_vagrant.sh`

## Build for PROD

1. Run `gulp`.
This will build project to sub-folder `build/`
which should be committed to production repo
2. `npm test` to launch resulting **production** web-server locally

