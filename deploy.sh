#!/bin/bash

# Define the container name
container_name="bbs_be"
#   git reset --hard && git pull
   docker build --no-cache -t bbs_be:latest .
# Check if the container exists
if [ "$(docker ps -a -q -f name=${container_name})" ]; then
    # Container exists, proceed with Git operations and Docker commands
    docker stop ${container_name}
    docker rm ${container_name}
    docker run -d --name ${container_name} -v /root/BBS/BBS_APP/files:/usr/src/files -p 9003:9003 --restart unless-stopped bbs_be
else
    # Container does not exist
    echo "The container $container_name does not exist."
    echo "You may want to create the container or take appropriate actions."
    docker run -d --name ${container_name} -v /root/BBS/BBS_APP/files:/usr/src/files -p 9003:9003 --restart unless-stopped bbs_be
fi
