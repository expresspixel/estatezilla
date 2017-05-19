<?php
namespace Zizaco\Confide;

use Zizaco\Confide\UserValidator as ConfideUserValidator;
use Zizaco\Confide\UserValidatorInterface;

class UserProspectValidator extends ConfideUserValidator implements UserValidatorInterface
{

	public $rules = [
        'create' => [
            'email'    => 'required|email',
            'firstname' => 'required|alpha',
            'lastname' => 'required|alpha',
        ],
        'update' => [
            'email'    => 'required|email',
            'firstname' => 'required|alpha',
            'lastname' => 'required|alpha',
        ]
    ];
	
	  /**
     * Validates if the given user is unique. If there is another
     * user with the same credentials but a different id, this
     * method will return false.
     *
     * @param ConfideUserInterface $user
     *
     * @return boolean True if user is unique.
     */
    public function validateIsUnique(ConfideUserInterface $user)
    {
        $identity = [
            'email'    => $user->email
        ];

        foreach ($identity as $attribute => $value) {

            $similar = $this->repo->getUserByIdentity([$attribute => $value]);

            if (!$similar || $similar->getKey() == $user->getKey()) {
                unset($identity[$attribute]);
            } else {
                $this->attachErrorMsg(
                    $user,
                    'confide::confide.alerts.duplicated_credentials',
                    $attribute
                );
            }

        }

        if (!$identity) {
            return true;
        }

        return false;
    }
	

}