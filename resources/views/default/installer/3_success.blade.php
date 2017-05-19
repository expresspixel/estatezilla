@extends('installer.default')

{{-- Content --}}

@section('content')
<div class="row">
	<div class="col-sm-10 col-sm-offset-1">
					<div class="alert alert-success" role="alert"><strong>Success,</strong> estatezilla has been installed!</div>

<br /><p>Your site's now ready to use. Login to your admin using the details entered.</p>
<br />
	</div>
</div>


	<form class="form-horizontal">

  <div class="form-group">
    <label for="inputPassword3" class="col-sm-3 control-label text-left">Username</label>
    <div class="col-sm-9">
		      <p class="form-control-static">{{ $username }}</p>
    </div>
  </div>  
  <div class="form-group">
    <label for="inputPassword3" class="col-sm-3 control-label">Password</label>
    <div class="col-sm-9">
		<p class="form-control-static"><em>Your chosen password</em></p>
    </div>
  </div> 
    
    <br />
    <br />
  <div class="form-group">
    <div class="col-sm-offset-3 col-sm-9">
      <a href="{{url('admin')}}" class="btn btn-default">Go to your admin&nbsp;&nbsp;&nbsp;<i class="fa fa-chevron-right"></i></a>
    </div>
  </div>
  
</form>
	
@stop
