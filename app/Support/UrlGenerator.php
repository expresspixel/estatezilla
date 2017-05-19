<?php
namespace App\Support;

use Illuminate\Routing\UrlGenerator as BaseGenerator;

class UrlGenerator extends BaseGenerator
{
    protected function newGetRootUrl($scheme, $root = null)
    {
        if ($root == null) {
            $root = parent::getRootUrl($scheme). (defined('LARAVEL_SHARED') ? '/public' : '');
        }
        return parent::getRootUrl($scheme, $root);
    }
    /**
     * Generate a URL to an application asset.
     *
     * @param  string  $path
     * @param  bool|null  $secure
     * @return string
     */
    public function asset($path, $secure = null)
    {
        if ($this->isValidUrl($path)) {
            return $path;
        }

        // Once we get the root URL, we will check to see if it contains an index.php
        // file in the paths. If it does, we will remove it since it is not needed
        // for asset paths, but only for routes to endpoints in the application.
        $root = $this->newGetRootUrl($this->getScheme($secure));

        return $this->removeIndex($root).'/'.trim($path, '/');
    }

    /**
     * Generate a URL to an asset from a custom root domain such as CDN, etc.
     *
     * @param  string  $root
     * @param  string  $path
     * @param  bool|null  $secure
     * @return string
     */
    public function assetFrom($root, $path, $secure = null)
    {
        // Once we get the root URL, we will check to see if it contains an index.php
        // file in the paths. If it does, we will remove it since it is not needed
        // for asset paths, but only for routes to endpoints in the application.
        $root = $this->newGetRootUrl($this->getScheme($secure), $root);

        return $this->removeIndex($root).'/'.trim($path, '/');
    }
}