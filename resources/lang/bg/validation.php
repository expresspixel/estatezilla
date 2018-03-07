<?php

return [

	/*
	|--------------------------------------------------------------------------
	| Validation Language Lines
	|--------------------------------------------------------------------------
	|
	| The following language lines contain the default error messages used by
	| the validator class. Some of these rules have multiple versions such
	| as the size rules. Feel free to tweak each of these messages here.
	|
	*/

	"accepted"             => "The :attribute must be accepted.",
	"active_url"           => "Невалиден адрес - :attribute.",
	"after"                => ":attribute трябва да е дата след :date.",
	"alpha"                => ":attribute може да съдържа единствено букви.",
	"alpha_dash"           => ":attribute може да съдържа единствено букви, цифри и тирета.",
	"alpha_num"            => ":attribute може да съдържа единствено букви и цифри.",
	"array"                => ":attribute трябва да е списък.",
	"before"               => ":attribute трябва да е дата преди :date.",
	"between"              => [
		"numeric" => ":attribute трябва да е между :min и :max.",
		"file"    => ":attribute трябва да е между :min и :max KB.",
		"string"  => ":attribute трябва да е между :min и :max символа.",
		"array"   => ":attribute трябва да е между :min и :max елемента.",
	],
	"boolean"              => ":attribute трябва да е true или false.",
	"confirmed"            => "Потвърждението на :attribute не е правилно.",
	"date"                 => ":attribute не е валидна дата.",
	"date_format"          => ":attribute не отговаря на следният формат:format.",
	"different"            => ":attribute и :other трябва да са различни.",
	"digits"               => ":attribute трябва да е :digits цифри.",
	"digits_between"       => ":attribute трябва да е между :min и :max цифри.",
	"email"                => ":attribute трябва да е валиден е-мейл адрес.",
	"filled"               => "Полето :attribute е задължително.",
	"exists"               => "Избраният атрибут :attribute е невалиден.",
	"image"                => ":attribute трябва да е снимка.",
	"in"                   => "Избраният атрибут :attribute е невалиден.",
	"integer"              => ":attribute трябва да е цяло число.",
	"ip"                   => ":attribute трябва да е валиден IP адрес.",
	"max"                  => [
		"numeric" => ":attribute не може да е по-голямо от :max.",
		"file"    => ":attribute не може да е повече от :max KB.",
		"string"  => ":attribute не може да е повече от :max символа.",
		"array"   => ":attribute не може да има повече от :max елемента.",
	],
	"mimes"                => ":attribute трябва да е файл от тип: :values.",
	"min"                  => [
		"numeric" => ":attribute трябва да е поне :min.",
		"file"    => "The :attribute трябва да е поне :min KB.",
		"string"  => "The :attribute трябва да е поне :min символа.",
		"array"   => "The :attribute трябва да има поне :min елемента.",
	],
	"not_in"               => "Избраният атрибут :attribute е невалиден.",
	"numeric"              => ":attribute трябва да е число.",
	"regex"                => ":attribute има невалиден формат.",
	"required"             => "Полето :attribute е задължително.",
	"required_if"          => "Полето :attribute е задължително, когато :other е :value.",
	"required_with"        => "Полето :attribute е задължително, когато :values е зададено.",
	"required_with_all"    => "Полето :attribute е задължително, когато :values е зададено.",
	"required_without"     => "Полето :attribute е задължително, когато :values не е зададено.",
	"required_without_all" => "Полето :attribute е задължително, когато нито едно от :values не е зададено.",
	"same"                 => "Полетата :attribute и :other трябва да са еднакви.",
	"size"                 => [
		"numeric" => ":attribute трябва да е :size.",
		"file"    => ":attribute трябва да е :size KB.",
		"string"  => ":attribute трябва да е :size символа.",
		"array"   => ":attribute трябва да съдържа :size елемента.",
	],
	"unique"               => ":attribute трябва да има уникална стойност.",
	"url"                  => "Формата на :attribute е невалиден.",
	"timezone"             => ":attribute трябва да е валидна времева зона.",

	/*
	|--------------------------------------------------------------------------
	| Custom Validation Language Lines
	|--------------------------------------------------------------------------
	|
	| Here you may specify custom validation messages for attributes using the
	| convention "attribute.rule" to name the lines. This makes it quick to
	| specify a specific custom language line for a given attribute rule.
	|
	*/

	'custom' => [
		'attribute-name' => [
			'rule-name' => 'custom-message',
		],
	],

	/*
	|--------------------------------------------------------------------------
	| Custom Validation Attributes
	|--------------------------------------------------------------------------
	|
	| The following language lines are used to swap attribute place-holders
	| with something more reader friendly such as E-Mail Address instead
	| of "email". This simply helps us make messages a little cleaner.
	|
	*/

	'attributes' => [],

];
