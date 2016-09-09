databox-editor-vagrant
===================

A Vagrant environment that encapsulates the instructions for setting up a Databox Application Editor as detailed in the [iot-red repository](https://github.com/me-box/iot.red) readme.

To use, first ensure that you have a working [Vagrant installation](https://www.vagrantup.com/). Rename `config.rb.example` to `config.rb` and open up in a text editor. Configuration values are given as a [Ruby hash](http://docs.ruby-lang.org/en/2.0.0/Hash.html). Information regarding setting the values in the *databox_application_server* and *iot.red* keys can be found in the [iot-red repository](https://github.com/me-box/iot.red) readme instructions. The value for *IP* is the static IP address you want to assign to the Vagrant machine and is the address that the Databox editor will be available on. The value for *memory* sets the available memory for the Vagrant virtual machine (in megabytes), a minimum of 2048mb is recommended. Once you have edited the configuration file run `vagrant up` to start the machine and then point your browser at **http://*{IP}*** when it has finished booting.
