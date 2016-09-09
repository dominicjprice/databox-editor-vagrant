# -*- mode: ruby -*-
# vi: set ft=ruby :

require "json"
require "./config.rb"

CONSTANTS = {
    "databox_application_server" => {
        "name" => "databox-app-server",
        "mongodb" => {
            "host" => "databox-app-server-mongodb",
            "port" => "27017",
            "user" => "user",
            "pass" => "pass",
            "db" => "databox-app-server"
        }
    },
    "mongodb" => {
        "name" => "mongodb",
        "user" => "user",
        "pass" => "pass",
        "database" => "db"
    }
}

Vagrant.configure(2) do |c|

    c.vm.box = "ubuntu/wily64"
    
    c.vm.network "private_network", ip: CONFIG["IP"]
    
    c.vm.provider "virtualbox" do |v|
        v.memory = CONFIG["memory"]
    end
    
    c.vm.provision "shell", inline: <<-SHELL
    
        export DEBIAN_FRONTEND=noninteractive
        apt-get update
        apt-get install -y git build-essential
    
        INSTALLDIR="/opt/databox-app-server"
        IP="#{CONFIG["IP"]}"
    
        if [ ! -e "$INSTALLDIR" ]; then
            git clone -o origin -b master \
                    https://github.com/me-box/databox-app-server.git $INSTALLDIR
        else
            cd $INSTALLDIR && git pull origin master
        fi
        cat << EOM > $INSTALLDIR/config.json
#{JSON.generate(CONSTANTS["databox_application_server"]
        .merge(CONFIG["databox_application_server"]))}
EOM
        sed -i -e "s/datashop\\.amar\\.io\\/user/$IP\\/das\\/user/" \
                -e "s/datashop\\.amar\\.io/$IP/" $INSTALLDIR/email.ls
        
    SHELL
  
    c.vm.provision "docker" do |d|

        conf = CONSTANTS["databox_application_server"]
        
        d.pull_images "tutum/mongodb"
        
        d.run "tutum/mongodb",
                auto_assign_name: false,
                args: "--name #{conf["mongodb"]["host"]} \
                        -e MONGODB_USER=\"#{conf["mongodb"]["user"]}\" \
                        -e MONGODB_PASS=\"#{conf["mongodb"]["pass"]}\" \
                        -e MONGODB_DATABASE=\"#{conf["mongodb"]["db"]}\""
                        
        d.build_image "/opt/databox-app-server", args: "-t #{conf["name"]}"
        
        d.run conf["name"],
                auto_assign_name: false,
                args: "--name #{conf["name"]} -e PORT=80 \
                        --link #{conf["mongodb"]["host"]}:#{conf["mongodb"]["host"]}"
                        
    end
    
    c.vm.provision "shell", inline: <<-SHELL
    
        export DEBIAN_FRONTEND=noninteractive
        curl -sL https://deb.nodesource.com/setup_6.x | bash -
        apt-get update
        apt-get install -y redis-server nodejs
        
        npm install -g grunt-cli pm2 webpack
        
        if [ ! -e "/opt/node-red" ]; then
            git clone https://github.com/me-box/node-red.git /opt/node-red
        else
            cd /opt/node-red && git pull origin master
        fi
        cd /opt/node-red && npm install && npm rebuild node-sass && grunt build
        cd /opt/node-red && nohup node red 0<&- &>/dev/null &
        
    SHELL
    
    c.vm.provision "docker" do |d|
    
        d.pull_images "tutum/mongodb"
        
        d.run "tutum/mongodb",
                auto_assign_name: false,
                args: "--name #{CONSTANTS["mongodb"]["name"]} \
                        -p 0.0.0.0:27017:27017 \
                        -p 0.0.0.0:27018:27018 \
                        -e MONGODB_USER=\"#{CONSTANTS["mongodb"]["user"]}\" \
                        -e MONGODB_PASS=\"#{CONSTANTS["mongodb"]["pass"]}\" \
                        -e MONGODB_DATABASE=\"#{CONSTANTS["mongodb"]["database"]}\""
                        
    end
  

    c.vm.provision "shell", inline: <<-SHELL
    
        if [ ! -e "/opt/iot.red" ]; then
            git clone https://github.com/me-box/iot.red.git /opt/iot.red
        else
            cd /opt/iot.red && git pull origin master
        fi
        
        if [ ! -e "/home/vagrant/iot.red" ]; then
            ln -s /opt/iot.red /home/vagrant/iot.red
        fi
        if [ ! -e "/root/iot.red" ]; then
            ln -s /opt/iot.red /root/iot.red
        fi
        
        IP="#{CONFIG["IP"]}"
        SECRET="#{CONFIG["iot.red"]["secret"]}"
        GITHUB_CLIENT_ID="#{CONFIG["iot.red"]["github"]["client_id"]}"
        GITHUB_CLIENT_SECRET="#{CONFIG["iot.red"]["github"]["client_secret"]}"
        MONGO_USER="#{CONSTANTS["mongodb"]["user"]}"
        MONGO_PASS="#{CONSTANTS["mongodb"]["pass"]}"
        MONGO_DB="#{CONSTANTS["mongodb"]["database"]}"
        
        sed -e "s/127\\.0\\.0\\.1/$IP/" /opt/iot.red/node-red-react-editor/js/config.sample.js \
                > /opt/iot.red/node-red-react-editor/js/config.js
                
        sed -e "s/a secret phrase/$SECRET/" \
                -e "s/\\[yourgithubclientid\\]/\\"$GITHUB_CLIENT_ID\\"/" \
                -e "s/\\[yourgithubclientsecret\\]/\\"$GITHUB_CLIENT_SECRET\\"/" \
                -e "s/\\[githubcallbackurl\\]/\\"http:\\/\\/$IP\\/auth\\/github\\/callback\\"/" \
                -e "s/store\\.upintheclouds\\.org/$IP\\/das/" \
                -e "s/mongodb:\\/\\/localhost\\/passport/mongodb:\\/\\/$MONGO_USER:${MONGO_PASS}@localhost\\/$MONGO_DB/" \
                /opt/iot.red/red-server/config.sample.js \
                > /opt/iot.red/red-server/config.js
                
        sed -i -e "s/store\\.upintheclouds\\.org/$IP\\/das/" \
                /opt/iot.red/node-red-react-editor/webpack.config.js
		
        sed -i -e "s/store\\.upintheclouds\\.org/$IP\\/das/" \
                /opt/iot.red/node-red-react-editor/webpack.prod.config.js
  
        cd /opt/iot.red/red-server && npm install
        cd /opt/iot.red/node-red-react-editor && npm install
        cd /opt/iot.red && ./startprod.sh
      
        if [ ! -e "/opt/frontend-proxy" ]; then
            mkdir /opt/frontend-proxy
        fi
        echo "FROM rgoyard/apache-proxy:latest" >> /opt/frontend-proxy/Dockerfile
        echo "ADD proxy.conf /conf/" >> /opt/frontend-proxy/Dockerfile
        echo "ProxyPass /das http://#{CONSTANTS["databox_application_server"]["name"]}/" \
                >> /opt/frontend-proxy/proxy.conf
        echo "ProxyPass / http://#{CONFIG["IP"]}:8080/" >> /opt/frontend-proxy/proxy.conf
    
    SHELL

    c.vm.provision "docker" do |d|
        
        d.build_image "/opt/frontend-proxy", args: "-t frontend-proxy"
        
        app_server_name = CONSTANTS["databox_application_server"]["name"]
        
        d.run "frontend-proxy", 
                auto_assign_name: false,
                args: "--name frontend-proxy \
                        --link #{app_server_name}:#{app_server_name} \
                        -p 80:80"

    end

end
