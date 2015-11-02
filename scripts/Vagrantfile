# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.provider :virtualbox do |vb|
    vb.customize ["modifyvm", :id, "--memory", "512"]
  end

  # Forward the Rails server default port to the host
  config.vm.network :forwarded_port, guest: 3000, host: 3000
  config.vm.network :forwarded_port, guest: 8080, host: 8080

  config.vm.synced_folder ".", "/home/vagrant/nemobile"
  config.vm.synced_folder "../", "/home/vagrant/repos_root"

  # Use Chef Solo to provision our virtual machine
  config.vm.provision :chef_solo do |chef|
    #chef.cookbooks_path = ["cookbooks", "site-cookbooks"]
    chef.version = "12.3.0"
    chef.add_recipe "apt"
    chef.add_recipe "nodejs"
    chef.add_recipe "vim"
  end

  config.vm.provision :shell, path: "vagrant_provision.sh"
end