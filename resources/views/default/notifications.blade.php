@if ($errors->any())
    <div class="alert alert-danger alert-block">
        <button type="button" class="close" data-dismiss="alert">&times;</button>
        <h4>{{ __('Error') }}</h4>
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@elseif (Session::get('success'))
    <div class="alert alert-success alert-block">
        <button type="button" class="close" data-dismiss="alert">&times;</button>
        <h4>Success</h4>
        @if(is_array(json_decode(Session::get('success'),true)))
            {{ implode('', Session::get('success')->all(':message<br/>')) }}
        @else
            {{ Session::get('success') }}
        @endif
    </div>
@elseif (Session::get('flash_warning'))
    <div class="alert alert-warning">
        @if(is_array(json_decode(Session::get('warning'),true)))
            {{ implode('', Session::get('warning')->all(':message<br/>')) }}
        @else
            {{ Session::get('warning') }}
        @endif
    </div>
@elseif (Session::get('info'))
    <div class="alert alert-info">
        @if(is_array(json_decode(Session::get('info'),true)))
            {{ implode('', Session::get('info')->all(':message<br/>')) }}
        @else
            {{ Session::get('info') }}
        @endif
    </div>
@elseif (Session::get('danger'))
    <div class="alert alert-danger">
        @if(is_array(json_decode(Session::get('danger'),true)))
            {{ implode('', Session::get('danger')->all(':message<br/>')) }}
        @else
            {{ Session::get('danger') }}
        @endif
    </div>
@elseif (Session::get('message'))
    <div class="alert alert-info">
        @if(is_array(json_decode(Session::get('message'),true)))
            {{ implode('', Session::get('message')->all(':message<br/>')) }}
        @else
            {{ Session::get('message') }}
        @endif
    </div>
@endif
