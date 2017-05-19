<?php

/**
 * Create a Directory Map
 *
 * Reads the specified directory and builds an array
 * representation of it.  Sub-folders contained with the
 * directory will be mapped as well.
 *
 * @access	public
 * @param	string	path to source
 * @param	int		depth of directories to traverse (0 = fully recursive, 1 = current dir, etc)
 * @return	array
 */
if ( ! function_exists('directory_map'))
{
	function directory_map($source_dir, $directory_depth = 0, $hidden = FALSE)
	{
		if ($fp = @opendir($source_dir))
		{
			$filedata	= array();
			$new_depth	= $directory_depth - 1;
			$source_dir	= rtrim($source_dir, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
			while (FALSE !== ($file = readdir($fp)))
			{
				// Remove '.', '..', and hidden files [optional]
				if ( ! trim($file, '.') OR ($hidden == FALSE && $file[0] == '.'))
				{
					continue;
				}
				if (($directory_depth < 1 OR $new_depth > 0) && @is_dir($source_dir.$file))
				{
					$filedata[$file] = directory_map($source_dir.$file.DIRECTORY_SEPARATOR, $new_depth, $hidden);
				}
				else
				{
					$filedata[] = $file;
				}
			}
			closedir($fp);
			return $filedata;
		}
		return FALSE;
	}
}


if ( ! function_exists('unslug'))
{
	function unslug($slug)
	{
        $slug = preg_replace('/\\.[^.\\s]{3,4}$/', '', $slug);
        $unslug = ucwords(str_replace(['-', '_'], ' ', $slug));
        return $unslug;
    }
}

if (!function_exists('_l')) {
    function _l($string) {
		if (function_exists('__')) {
			return __($string);
		} else {
			return $string;
		}
    }
}

if (!function_exists('route_lang')) {
    function route_lang($string = null, $parameters = null) {
        #dd(Route::has(Lang::get('routes.'.$string)));
        if(!Lang::get('routes.'.$string))
            return $string;
        if($parameters && Route::has('routes.'.$string))
            return URL::route(Lang::get('routes.'.$string), $parameters);
        elseif($string && Route::has('routes.'.$string))
            return URL::route(Lang::get('routes.'.$string));
        elseif($string && Route::has(Lang::get('routes.'.$string)))
            return URL::route(Lang::get('routes.'.$string));
        else {
            $locales = Config::get('app.available_locales');
            $locale = Config::get('app.locale');

            if(count($locales) > 1) {
                return URL::to($locale);
            }  else {
                return URL::to('');
            }
        }
    }
}

if (!function_exists('route_page')) {
    function route_page($route_name, $parameters = null) {
				$handlers = Config::get('page_handlers');
        if(in_array($route_name, array_keys($handlers))) {
            if($parameters)
                return url(@$handlers[$route_name], $parameters);
            else
                return url(@$handlers[$route_name]);
        } else {
            return '';
        }
    }
}

if (!function_exists('property_image')) {
    function property_image($image, $size, $type = 'photo') {
        #dd($image);
        if (isset($image)) {
            $str = URL::to("property_images/$size/$type-".$image);
        } else {
            $str = URL::to("property_images/$size/no-image.jpg");
        }
        return $str;
    }
}

if (!function_exists('theme_asset')) {
    function theme_asset($file) {
				$theme = Setting::get('theme', 'default');
        return asset("themes/".$theme."/".$file);
    }
}
