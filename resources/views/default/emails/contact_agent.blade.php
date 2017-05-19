<!DOCTYPE html>
<html lang="en-US">
	<head>
		<meta charset="utf-8">
	</head>
	<body>
		<h2>Message from {{ $full_name }}</h2>

		<div>
			{{ $comments }}
			<br />
			property : {{ $property }}<br />
			phone number : {{ $phone_number }}<br />
			email : {{ $your_email }}
		</div>
	</body>
</html>