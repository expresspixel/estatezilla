<?php namespace App\Http\Controllers;

use Intervention\Image\Facades\Image;
use Response;

class ImageController extends Controller {


    /**
     * Inject the models.
     */
    public function __construct()
    {

    }
    public function sendImage($output, $modified, $browserCache) {
		$lastModified = gmdate('D, d M Y H:i:s', $modified).' GMT';
		$eTag = '"' . md5($output) . '"';
		$isModified = false;
		header("Content-Type: image/jpeg");

		header('Cache-Control: private, max-age='. $browserCache);
		header('Expires: '.gmdate('D, d M Y H:i:s', time()+$browserCache).' GMT');
		header('Content-Length: ' . strlen($output));
		header('Last-Modified: ' . $lastModified);
		header('ETag: ' . $eTag);

		$ifModifiedSince = isset($_SERVER['HTTP_IF_MODIFIED_SINCE'])
			? stripslashes($_SERVER['HTTP_IF_MODIFIED_SINCE'])
			: false;
		$ifNoneMatch = isset($_SERVER['HTTP_IF_NONE_MATCH'])
			? stripslashes($_SERVER['HTTP_IF_NONE_MATCH'])
			: false;

		if (!$ifModifiedSince && !$ifNoneMatch) {
			$isModified = true;
		} elseif ($ifNoneMatch && $ifNoneMatch !== $eTag) {
			$isModified = true;
		} else if ($ifModifiedSince && $ifModifiedSince != $lastModified) {
			$isModified = true;
		}

		if ($isModified) {
			#Response::make($image, 200, array('Content-Type' => 'image/jpeg'));
			echo $output;
		} else {
			header('HTTP/1.1 304 Not Modified');
		}
	}
	/**
	 * Returns the image
	 *
	 * @return Response
	 */
	public function getIndex($type, $property_id, $imageType, $path) {

        $hash_folder = md5($property_id)[0]."/".md5($property_id)[1];
        $hash_path = storage_path('properties/'.$hash_folder.'/'.md5($property_id).'/'.$imageType . '/'. $path);
		
		$default_sizes = [
			'thumbs' 	=> ['width' => 100, 'height' => 75],
			'ht' 	 	=> ['width' => 135, 'height' => 100],
			'mini' 		=> ['width' => null,'height' => 300],
			'slideshow' => ['width' => 750, 'height' => 420],
			'listings' 	=> ['width' => 176, 'height' => 120],
			'full' 		=> ['width' => 970, 'height' => 600],
		];
		if(in_array($type, array_keys($default_sizes))) {
			$width = $default_sizes[$type]['width'];
			$height = $default_sizes[$type]['height'];
		} else {
            list($width, $height) = explode("x", $type);
        }

		$browserCache = 60*60*24*7;
		$browserCache = 1;
		$quality = 95;
		#dd($hash_path);
		try {
			$modified = 0;
			if(file_exists($hash_path)) {
				$image = Image::cache(function($image) use($hash_path, $width, $height, &$modified) {
					$image = $image->make($hash_path)->fit($width, $height);
					$modified = array_key_exists('modified', $image->properties) ? $image->properties['modified'] : time();
				});
			} else {
				$image = Image::cache(function($image) use($hash_path, $width, $height, &$modified) {
					$image = $image->make(base_path('resources/assets/images/no-image.jpg'))->fit($width, $height);
					$modified = array_key_exists('modified', $image->properties) ? $image->properties['modified'] : time();
				});
			}
			$this->sendImage($image, $modified, $browserCache);
		} catch (Exception $e) {
			header("HTTP/1.0 404 Not Found");
		}

        return Response::make($image, 200, array('Content-Type' => 'image/jpeg'));
	}

	public function getMarker($number) {
		//Set the Content Type
		header('Content-type: image/png');

		// Create Image From Existing File
		$png_image = imagecreatefrompng(base_path().'/public/assets/css/images/marker_empty.png');
		imageAlphaBlending($png_image, true);
		imageSaveAlpha($png_image, true);

		// Allocate A Color For The Text
		$black = imagecolorallocate($png_image, 0, 0, 0);
		// Set Path to Font File
		$font_path = base_path().'/public/assets/fonts/OpenSans-Bold.ttf';
		#$font_path = base_path().'/public/arial.ttf';

		// Set Text to Be Printed On Image
		$text = $number;
		$fontsize = 26;
		$imagewidth = 89;
		$imageheight = 125;

		### Get exact dimensions of text string
		$box = @imageTTFBbox($fontsize,0,$font_path,$text);

		### Get width of text from dimensions
		$textwidth = abs($box[4] - $box[0]);

		### Get height of text from dimensions
		$textheight = abs($box[5] - $box[1]);

		### Get x-coordinate of centered text horizontally using length of the image and length of the text
		$xcord = ($imagewidth/2)-($textwidth/2)-2;

		### Get y-coordinate of centered text vertically using height of the image and height of the text
		$ycord = ($imageheight/2)+($textheight/2);
		$ycord = 52;

		#dd($textwidth, $textheight);

		// Print Text On Image
		// Add the text
		imagettftext($png_image, $fontsize, 0, $xcord, $ycord, $black, $font_path, $text);

		// Send Image to Browser
		imagepng($png_image);

		// Clear Memory
		imagedestroy($png_image);
		die();
	}
}