<?php namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

abstract class Request extends FormRequest {

    // OVERRIDE FORBIDDEN RESPONSE
    public function forbiddenResponse()
    {
        // Optionally, send a custom response on authorize failure
        // (default is to just redirect to initial page with errors)
        //
        // Can return a response, a view, a redirect, or whatever else
        return new Response('Forbidden', 403);
    }

    // OVERRIDE VALIDATION RESPONSE
    public function response(array $errors)
    {
        return new JsonResponse(
            array(
                'status' => 'error',
                'errors' => $errors
            ),
            422
        );
        if ($this->ajax() || $this->wantsJson())
        {
            return new JsonResponse(
                array(
                    'status' => 'error',
                    'errors' => $errors
                ),
                422
            );
        }
        return $this->redirector->to($this->getRedirectUrl())
            ->withInput($this->except($this->dontFlash))
            ->withErrors($errors, $this->errorBag);
    }

    protected function getSegmentFromEnd($position_from_end = 1) {
        $segments =$this->segments();
        return $segments[sizeof($segments) - $position_from_end];
    }

}
