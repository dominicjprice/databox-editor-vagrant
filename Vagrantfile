# -*- mode: ruby -*-
# vi: set ft=ruby :

require 'json'

setup = {
	"IP" => "192.168.101.87",
	"MONGODB" => {
		"USER" => "user",
		"PASS" => "pass",
		"DATABASE" => "db"
	}
}

Vagrant.configure(2) do |config|
  
  config.vm.box = "ubuntu/wily64"
  
  config.vm.network "private_network", ip: setup["IP"]
  
  config.vm.provider "virtualbox" do |v|
    v.memory = 2048
  end
    
  databox_app_server_path="/opt/databox-app-server"
    
  config.vm.provision "shell", args: [ databox_app_server_path ], inline: <<-SHELL
  
  	databox_app_server_path=$1
  	if [ ! -e "$databox_app_server_path" ]; then
  		git clone -o origin -b master \
  				https://github.com/dominicjprice/databox-app-server.git \
  				$databox_app_server_path
  	else
  		cd $databox_app_server_path && git pull origin master
  	fi
  	cp -rf /vagrant/databox-app-server/* $databox_app_server_path
  
  SHELL
  
  config.vm.provision "docker" do |d|

	das_config = JSON.parse(File.read('databox-app-server/config.json'))
   
  	d.pull_images "tutum/mongodb"
    
    d.run "tutum/mongodb",
      auto_assign_name: false,
      args: "--name #{das_config["mongodb"]["host"]} \
        -e MONGODB_USER=\"#{das_config["mongodb"]["user"]}\" \
        -e MONGODB_PASS=\"#{das_config["mongodb"]["pass"]}\" \
        -e MONGODB_DATABASE=\"#{das_config["mongodb"]["db"]}\""
        
    d.build_image databox_app_server_path,
      args: "-t databox-app-server"
      
    d.run "databox-app-server",
      auto_assign_name: false,
      args: "--name databox-app-server \
      	--link #{das_config["mongodb"]["host"]}:#{das_config["mongodb"]["host"]} \
      	-e PORT=80"
          
  end
  
  config.vm.provision "shell", inline: <<-SHELL
    
    curl -sL https://deb.nodesource.com/setup_6.x | bash -
    apt-get update
    apt-get install -y redis-server build-essential nodejs
    
    npm install -g grunt-cli pm2 webpack
    
    if [ ! -e "/opt/node-red" ]; then
    	git clone https://github.com/me-box/node-red.git /opt/node-red
    else 
    	cd /opt/node-red && git pull origin master
    fi    
    cd /opt/node-red && npm install && npm rebuild node-sass && grunt build
    cd /opt/node-red && nohup node red 0<&- &>/dev/null &
    
  SHELL
  
  config.vm.provision "docker" do |d|
   
  	d.pull_images "tutum/mongodb"
    
    d.run "tutum/mongodb",
      auto_assign_name: false,
      args: "--name mongodb \
        -p 0.0.0.0:27017:27017 \
        -p 0.0.0.0:27018:27018 \
        -e MONGODB_USER=\"#{setup["MONGODB"]["USER"]}\" \
        -e MONGODB_PASS=\"#{setup["MONGODB"]["PASS"]}\" \
        -e MONGODB_DATABASE=\"#{setup["MONGODB"]["DATABASE"]}\""
          
  end
  
  config.vm.provision "shell", inline: <<-SHELL
  
  	if [ ! -e "/opt/iot.red" ]; then
    	git clone https://github.com/me-box/iot.red.git /opt/iot.red
    fi
    
    if [ ! -e "/home/vagrant/iot.red" ]; then
    	ln -s /opt/iot.red /home/vagrant/iot.red
    fi
    if [ ! -e "/root/iot.red" ]; then
    	ln -s /opt/iot.red /root/iot.red
    fi
    
    cp -rf /vagrant/iot.red/* /opt/iot.red
  
    cd /opt/iot.red/red-server && npm install
    
    cd /opt/iot.red/node-red-react-editor && npm install
    		
    cd /opt/iot.red && ./startprod.sh
  
  SHELL

  config.vm.provision "docker" do |d|
  
    d.build_image "/vagrant/frontend-proxy",
  	  args: "-t frontend-proxy"
  	  
  	d.run "frontend-proxy",
  	  auto_assign_name: false,
  	  args: "--name frontend-proxy \
  	    --link databox-app-server:databox-app-server \
  	    -p 80:80"
  
  end

end
