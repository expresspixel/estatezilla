<!DOCTYPE html>
<html lang="en-US">
	<head>
		<meta charset="utf-8">
	</head>
	<body>
		<h2>Message from {{ $first_name }} {{ $last_name }}</h2>

		<div>
			{{ $comment }}
			<br />
			phone number : {{ $phone_number }}<br />
			email : {{ $email_address }}<br />
			url : {{ $url }}<br />
			report_type : {{ $report_type }}<br />
		</div>
	</body>
</html>