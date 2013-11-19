<?php
	/*require 'Slim/Slim.php';

	$app = new Slim();

	$app->get('/events', 'getEvents');
	$app->get('/events/:id',	'getEvent');
	$app->get('/events/search/:query', 'findByName');
	$app->post('/events', 'addEvent');
	$app->put('/events/:id', 'updateEvent');
	$app->delete('/events/:id',	'deleteEvent');

	$app->run();
	
	function getEvents(){
		$sql = "select * FROM events";
		try {
			$db = getConnection();
			$stmt = $db->query($sql);  
			$wines = $stmt->fetchAll(PDO::FETCH_OBJ);
			$db = null;
			echo '{"event": ' . json_encode($wines) . '}';
			echo json_encode($wines);
		} catch(PDOException $e) {
			echo '{"error":{"text":'. $e->getMessage() .'}}'; 
		}
	
	}
	
	function getConnection() {
		$dbhost="localhost";
		$dbuser="root";
		$dbpass="";
		$dbname="vmobile";
		$dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);	
		$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		return $dbh;
	}*/


$dbhandle = mysql_connect("localhost", "root", "") or die("Unable to connect to MySQL");
//echo "Connected to MySQL<br>";
$selected = mysql_select_db("vmobile",$dbhandle) or die("Could not select examples");






if($_GET['q'] == 'totalEvents'){
	
	echo '{"totalCount":20}';

}

if(isset($_GET['q']) && ($_GET['q'] == 'getEvents')){
	$return_arr = array();
	//echo "getEvents";
	$page = 0;
	if(isset($_GET['p'])){
		$page = $_GET['p'];
	}

	$fetch = mysql_query("SELECT * FROM events order by id "); 
	if($fetch === FALSE) {
		die(mysql_error()); // TODO: better error handling
	}
	while ($row = mysql_fetch_array($fetch, MYSQL_ASSOC)) {
		$row_array['id'] = $row['id'];
		$row_array['event_name'] = $row['event_name'];
		$row_array['session_id'] = $row['session_id'];
		$row_array['session_name'] = $row['session_name'];
		$row_array['date_created'] = $row['date_created'];
		$row_array['last_modified'] = $row['last_modified'];
		$row_array['status'] = $row['status'];
		$row_array['role'] = $row['role'];

		array_push($return_arr,$row_array);
	}

	//echo json_encode($return_arr); 
	echo '({"words":[{"_id":"E5ABBF51-CF88-0C5F-4317-86A6F05EBB92","eventName":"praveen","createdBy":null,"dateCreated":"Thu Jul 18 20:43:01 CDT 2013","status":"open","contents":null,"addressId":null,"members":null,"tags":["51e317de5273e3c6d38988b8"]},{"_id":"21590949-8650-51AC-A3EE-1DD4C54DDA89","eventName":"ajan","createdBy":null,"dateCreated":"Thu Jul 18 20:43:49 CDT 2013","status":"open","contents":null,"addressId":null,"members":null,"tags":["51e317de5273e3c6d38988b7"]}]})';
}


?>