<?php
// api.php — backend storage for guest list
// GET  api.php           -> returns current state JSON
// POST api.php (JSON)    -> overwrites stored state with posted JSON

header('Content-Type: application/json');
header('Cache-Control: no-store');

$DATA_FILE = __DIR__ . '/data.json';

// SEED list — used only when data.json does not yet exist
$SEED_NAMES = [
  "Debapriya Kalpa","Asif Siraj","Tahasin Ahmed","Jay Patel","Tejas Patel",
  "Manthan Solanki","Komal Rajput","Falguni Makwana","Makwana Nirav","Ravi Damodar",
  "Shivani Ashokkumar","Smriti Sha","Vipul Pratapgiri","Devendrakumar Yashvant",
  "Lalita Hankori","Jainil Kamal","Kishan Vyas","Shivani Pancholi","Jitesh Popat",
  "Sarika Popat","Payal Jain","Shaily Desai","Sonam Singh","Ilsa Sayed","Nisha Nupur",
  "Gulshan","Sana Shaikh","Alisher Iqbal","Usman Qamar","Hetvi Darji","Sakshi Darji",
  "Hardik Suratia","Ayushi Soni","Opali Agarwal","Aryan Dave","Pavan Patel",
  "Sapna Narotam","Heer Isvar","Nithu","Hetvi","Tanisha Sony Pereira","Niharika Rajesh",
  "Vimal","Kimal","Janvi","Jigar","Hemali","Ronil","Reshma","Dikhsil","Mitesh",
  "Cristina","Payal","Diviesh","Hritik","Parth","Aman Raheja","Saysha Shah",
  "Shubham Gupta","Vishal Kumar","Kiranjeet Riar","Mahesh","Parvati","Swati",
  "Vishvesh","Neel","Prachi Parihar","Oishi Datta","Meet Shah","Veeru","Parthbhai",
  "Mihirbhai","Rahul","Rohit","Garima","Seema Shaikh","Raffin and Masood","Kiran",
  "Bhargavi","Meet Suthar","Himani","Yakin","Pooja","Hardik","Shristi","Utsav",
  "Nandini","Harshit","Rajvi","Abhishek","Jinal","Bhumi","Parth","Bhumi","Rajan",
  "Bhaumik + 1","Ruchi","Antra","Smakshi","Harsh","Sakshi Gaikwad","Drashti",
  "Prapti","Sugandha Kapoor","Zubi","Puneet","Vishal","Dhruv","Hunny","Mahnoor",
  "Disha","Riya","Shristi Gupta","Nagina","Diyaa","Sera + 1","Dhwani","Aman Abbas",
  "Pruthvi Nayak","Vidhi Nayak","nalz_974","Arooj Nayyar","Ghaniya Manzoor","Any",
  "DJ Romil","Sonia Phalswal","DJ Voix","Mansi","Gracie","Arya","Pratik",
  "Pratham Bhatt","Tamanna Bhatt","Jothy Nagalingam","Mitul Barot","Bhavin Dixit",
  "Vanshika Patel","Ayushi Mogera","Shitansh","Shivam Kapoor","Rumi","Yamini",
  "Krisha","Karan Ghoda","Aman Patel"
];

function seed_state($names) {
  $guests = [];
  foreach ($names as $i => $name) {
    $guests[] = [
      'id' => 'seed' . $i,
      'name' => $name,
      'walkin' => false,
      'checked' => false,
    ];
  }
  return ['guests' => $guests, 'updated' => 0];
}

function read_state($file, $seed) {
  if (!file_exists($file)) {
    $state = seed_state($seed);
    write_state($file, $state);
    return $state;
  }
  $raw = file_get_contents($file);
  $decoded = json_decode($raw, true);
  if (!is_array($decoded) || !isset($decoded['guests'])) {
    $state = seed_state($seed);
    write_state($file, $state);
    return $state;
  }
  return $decoded;
}

function write_state($file, $state) {
  $tmp = $file . '.tmp';
  $fh = fopen($tmp, 'w');
  if (!$fh) return false;
  if (flock($fh, LOCK_EX)) {
    fwrite($fh, json_encode($state, JSON_UNESCAPED_UNICODE));
    fflush($fh);
    flock($fh, LOCK_UN);
  }
  fclose($fh);
  return rename($tmp, $file);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $state = read_state($DATA_FILE, $SEED_NAMES);
  echo json_encode($state);
  exit;
}

if ($method === 'POST') {
  $body = file_get_contents('php://input');
  $incoming = json_decode($body, true);
  if (!is_array($incoming) || !isset($incoming['guests']) || !is_array($incoming['guests'])) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid payload']);
    exit;
  }
  $incoming['updated'] = isset($incoming['updated']) ? (int)$incoming['updated'] : (int)(microtime(true) * 1000);
  if (!write_state($DATA_FILE, $incoming)) {
    http_response_code(500);
    echo json_encode(['error' => 'write failed']);
    exit;
  }
  echo json_encode(['ok' => true, 'updated' => $incoming['updated']]);
  exit;
}

http_response_code(405);
echo json_encode(['error' => 'method not allowed']);
