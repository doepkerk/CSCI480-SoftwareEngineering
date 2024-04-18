# CSCI480-SoftwareEngineering

DESCRIPTION:
* This software uses speedtest-cli to conduct internet speed tests to monitor upload and download speeds. This data is being stored via a JSON file (speeds.json) and uploaded to HTML pages using Javascript. ApexChart.js library is used to make the graphs.

IMPLEMENTATIONS:
* Speedtest-cli was chosen due to its accuracy and usability for this project.
* ApexChart.js was chosen due to its design, functionality and usability. Its format allowed to the most interaction from a user prospect and was more visually pleasing than other JavaScript libraries. 
* Cron jobs were used to execute the speedtest every hour to keep data updated often for the monitor.
* HTML/CSS were used to create the webpage.
* A python server is used to host the website.

RECOMMENDATIONS: 
* Further investigation on other speedtest software could be done and cross-analysis between these softwares could be used to monitor internet speeds.
* The website does not store data over multiple months so it is up to the user to retain record of the summary data once it is provided through the website via PNG or PDF.

CODE DIAGRAM:

![image](https://github.com/doepkerk/CSCI480-SoftwareEngineering/assets/143119090/e2564869-027a-42f6-8d6a-4922e55c41cb)

PREREQUISITES: 
* Python 3
* Speedtest-cli, which can be obtained here: https://github.com/sivel/speedtest-cli

HOW TO INSTALL:
* Ensure you have the prerequisites mentioned above, then:
1. Unzip the files in /home/admin/website/CSCI480-SoftwareEngineering-main/
2. Move the speed script file into /etc/cron.hourly, and give it execute permissions.
   (NOTE: Do NOT add any file extensions to the file name, leave it as "speed")
3. Start the Python web server by executing the startserver.sh script.
4. You should now be able to access the dashboard by going to (hostname).local:8000.

TROUBLESHOOTING:
* You may need to adjust file paths if your username, or hostname differ from the paths in the files.
* If the cron job isn't logging speeds, ensure you have the right permissions for the files.


