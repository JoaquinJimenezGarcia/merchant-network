# merchant-network

A permissioned Blockchain

## Prerequisites
Before installing this smart contract you must have installed NPM and YO (yaoman). Also, you must need Docker (https://docs.docker.com/install/linux/docker-ce/debian/#upgrade-docker-ce) and Docker Composer (https://docs.docker.com/compose/install/#install-compose).

### Installing Hyperledger Composer and Fabric
In order to use composer commands to install your server and deploy it, you will need to install Hyperledger Composer and Fabric with the next commands WITHOUT using "sudo" or "su"
- npm install -g composer
- npm install -g composer-rest-server
- npm install -g generator-hyperledger-composer
- npm install -g composer-playground

Then we must download and use our favourite code editor, in this case I have used Visual Studio Code and create a specific folder to save the necesaries scripts to download the server:

- mkdir ~/fabric-dev-servers && cd ~/fabric-dev-servers
- curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.tar.gz
- tar xzf fabric-dev-servers.tar.gz
- export FABRIC_VERSION=hlfv12
- ./downloadFabric.sh

Once started, we must start Fabric and create a Admin card to allow to use our smart contract:

- ./startFabric.sh
- ./createPeerAdminCard.sh

## Next Steps
Once cloned the repository, we must build the project with the following commands:

- composer archive create -t dir -n .
- composer card import --file networkadmin.card (this card is given in the code, for use your own take a look to https://hyperledger.github.io/composer/latest/playground/id-cards-playground).

## Deploying the server
When the network have been created, the next thing to do is deploy it:

- composer network install --card PeerAdmin@hlfv1 --archiveFile merchant-network@0.0.1.bna
- composer network start --networkName merchant-network --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card

## Final steps
The last thing is to expose the REST endpoint, and for it we will type the following in the project directory:

- composer-rest-server

And using the "admin@merchant-network" card we will chose "never use namespaces" and choose default options for the rest.

Once done, we could check it out in http://localhost:3000/explorer
