<?php namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Foundation\Inspiring;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;
use Gettext\Robo\GettextScanner;
use File;

class CreateTranslations extends Command {

	/**
	 * The console command name.
	 *
	 * @var string
	 */
	protected $name = 'translate';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Display an inspiring quote';

	/**
	 * Execute the console command.
	 *
	 * @return mixed
	 */
	public function handle()
	{
		$this->comment(PHP_EOL.Inspiring::quote().PHP_EOL);

					$directory = base_path('resources/views/default');
					$translations = new \Gettext\Translations();

					$files = File::allFiles($directory);
					foreach ($files as $file) {
							if (strpos($file->getFilename(), 'blade') !== false) {
								\Gettext\Extractors\Blade::fromFile($file->getPathname(), $translations);
								echo $file->getFilename();echo "\n";
							}
					}
					//dd($translations);

			$languages = ['en', 'fr'];
			foreach($languages as $language) {
					if(file_exists($directory.'/po/'.$language.'.json')) {
					$translations_saved = \Gettext\Translations::fromJsonDictionaryFile($directory.'/po/'.$language.'.json');
					$translations->mergeWith($translations_saved);
				}
				
				$content = \Gettext\Generators\Po::toString($translations);
				\Gettext\Generators\Po::toFile($translations, $directory.'/po/'.$language.'.po');
			}
	}

}
