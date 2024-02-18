<?php
	//need to change the "script_path" to the script file path
	if (isset($_POST['script_path'])) {
		$script_path = $_POST['script_path'];
		if (file_exists($script_path)) {
			$output = shell_exec("bash $script_path");
			echo "<pre>$output</pre>";
		} else {
			echo "Script not found.";
		}
	} else {
		echo "No script path provided.";
	}
?>