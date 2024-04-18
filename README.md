# CSCI480-SoftwareEngineering

This software uses speedtest-cli to conduct internet speed tests to monitor upload and download speeds. This data is being stored via a JSON file (speed.json) and uploaded to HTML pages using Javascript. ApexChart.js library is used to make the graphs. 

Prerequisites: 
Python 3

Speedtest-cli, which can be obtained here: https://github.com/sivel/speedtest-cli

How to install:

Ensure you have the prerequisites mentioned above, then:
1. Unzip the files in /home/admin/website/CSCI480-SoftwareEngineering-main/
2. Move the speed script file into /etc/cron.hourly, and give it execute permissions.
   (NOTE: Do NOT add any file extensions to the file name, leave it as "speed")
3. Start the Python web server by executing the startserver.sh script.
4. You should now be able to access the dashboard by going to (hostname).local:8000.
a
Troubleshooting
* You may need to adjust file paths if your username, or hostname differ from the paths in the files.
* If the cron job isn't logging speeds, ensure you have the right permissions for the files.


