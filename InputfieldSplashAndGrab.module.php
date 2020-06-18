<?php
namespace ProcessWire;

class InputfieldSplashAndGrab extends InputfieldImage implements ConfigurableModule {

	public static function getModuleInfo() {
		return array(
			'title' => 'SplashAndGrab',
			'version' => 100,
			'icon' => 'picture-o',
			'author' => 'Mats Neander',
			'summary' => 'Adds possibility to search and download free to use images from Unsplash.',
			'autoload' => 'template=admin',
			'requires' => 'ProcessWire>=3.0.0'
			);
	}

	public $maxFiles;
	public $uploadedFiles; 


	public static function getImagefields() {
    	$imgFields = wire('fields');
		foreach ($imgFields as $imgField) { 
			if ($imgField->type != "FieldtypeImage") {
				continue;
			}
			$imgFieldsOut[] = $imgField->name;
		}
		return $imgFieldsOut;
	}

	/**
	 * Ready
	 */
	public function ready() {
		
				$this->addHookAfter('InputfieldImage::render', $this, 'modifyInputfield');
				$this->addHookBefore('ProcessPageEdit::execute', $this, 'addDependencies');
				$this->addHookAfter('ProcessPageEdit::processInput', $this, 'processInput');
		
	}

	/**
	 * Modify inputfield
	 *
	 * @param HookEvent $event
	 */
	protected function modifyInputfield(HookEvent $event) {
		// Only for ProcessPageEdit or ProcessUser
		if($this->process != 'ProcessPageEdit' && $this->process != 'ProcessUser') return;
		if(!in_array($event->object->name, $this->useField)) return;
		$inputfield = $event->object;
		$out = $event->return;
		$page = $inputfield->hasPage;
		$field = $inputfield->hasField;

		$attrs = $this->getAttributes();

		//Get current pages imagefields
        $currentPage = $this->pages->get($this->input->get->id);
        $currentFields = $currentPage->fields;
        
		//$this->uploadedFiles = count($currentPage->$fieldName);
		//$this->maxFiles = $cf->maxFiles;


		$maximumFiles = $this->maxFiles == 0 ? 'data-maxfiles="999"' : 'data-maxfiles="' . $this->maxFiles . '"'  ;
			
		$out .= '<hr /><fieldset id="splashAndGrab" data-uploadedfiles="' . $this->uploadedFiles . '" ' . $maximumFiles . ' class="unsplash" data-id="' . $page->id . '" data-name="'. $field->name .'">';
		$out .= '<div uk-grid class="uk-flex-bottom">';
		$out .= '<div>';
		$out .= '<label for="unsplashMagic" class="uk-form-label">' . __("Search Unsplash") . '';
		$out .= '<input type="text" id="unsplashMagic" class="unsplashSearch"/></label>';
		$out .= '</div>';
		$out .= '<div>';
		$out .= '<button class="unsplashButton ui-button ui-widget ui-corner-all ui-state-default"><span class="ui-button-text">' . __("Search") . '</span></button>';
		$out .= '</div>';
		$out .= '</div>';
		$out .= '<div class="unsplashChosen"></div><div class="unsplashResults"><div class="resultsItems"></div></div></fieldset>';
		$event->return = $out;

	}

	/**
	 * Add JS and CSS dependencies
	 *
	 * @param HookEvent $event
	 */
	protected function addDependencies(HookEvent $event) {
		// Return if ProcessPageEdit is being loaded via AJAX
		if($this->config->ajax) return;
		$this->wire('modules')->get('InputfieldImage');

		// Add JS and CSS dependencies
		$config = $this->config;
		$info = $this->getModuleInfo();
		$version = $info['version'];
		$config->scripts->add($config->urls->{$this} . "{$this}.js?v={$version}");
		$config->styles->add($config->urls->{$this} . "{$this}.css?v={$version}");

		$this->config->js('InputfieldSplashAndGrab', array(
            'i18n' => array(
				'noHits' => __("Sorry. No hits for your query."),
				'totalhitsstring' => __("Hits"),
				'numberOfSelects' => __("Selected images"),
				'orientaions' => __("All orientations"),
				'colors' => __("All colors"),
				'portrait' => __("Portrait"),
				'landscape' => __("Landscape"),
				'squarish' => __("Squarish"),
				'latest' => __("Latest"),
				'relevant' => __("Relevant"),
				'black_and_white' => __("Black and White"),
				'black' => __("Black"),
				'white' => __("White"),
				'yellow' => __("Yellow"),
				'orange' => __("Orange"),
				'red' => __("Red"),
				'purple' => __("Purple"),
				'magenta' => __("Magenta"),
				'green' => __("Green"),
				'teal' => __("Tealish"),
				'blue' => __("Blue"),
				'of' => __("of"),
				'title_numoffiles' => __("The number of files you can select based on how many images you can upload and that are uploaded to this image field."),
				'photo_by' => __("Photo by"),
			),
			'settings' => array(
				'maxWidth' => $this->sizeField
			)
        ));

	}

	/**
	 * Process URLs in $input
	 *
	 * @param HookEvent $event
	 */
	protected function processInput(HookEvent $event) {
        $form = $event->arguments(0);
        // Only for main Page Edit form
        if ($form->name !== 'ProcessPageEdit') {
            return;
        }

        foreach ($this->input->post as $key => $value) {

            // Ignore unrelated input
            if (substr($key, 0, 8) !== 'unsplash' || empty($value)) {
                continue;
            }

            // Get variables from key name
            list($junk, $field_name, $page_id, $morejunk) = explode('*', $key);
            $field_name = $this->sanitizer->fieldName($field_name);
            $page = $this->pages->get((int) $page_id);
            $field = $this->fields->get($field_name);
            $is_image_field = $field->type instanceof FieldtypeImage;
			$field_value = $page->getUnformatted($field_name);
			
			$page->of(false);

			foreach ($value as $keytwo => $val) {
				
				$img = explode("*", $val); // $image[0] is url, $image[1] is description
				
				if ($field->maxFiles == 1 && count($field_value)) {
					$field_value->removeAll();
				}

				$pagefile = new Pageimage($field_value, $img[0]);
				$pagefile->rename($pagefile . ".jpg");
				$field_value->add($pagefile);
				$image = $field_value->last();
				$image->description = $img[1];
			}
			
			$page->save();


		}
    }	

	/**
	 * Config inputfields
	 *
	 */
	public function getModuleConfigInputfields( array $data) {
		$modules = $this->wire('modules');
		$inputfields = new InputfieldWrapper();

        $fieldImage = $modules->get("InputfieldAsmSelect");
        $fieldImage->name = "useField";
        $fieldImage->label = __("Image fields that should use the module.");
        $fieldImage->description = __("Choose the fields which should use the module.");
        foreach ($this->getImagefields() as $img) {
            $fieldImage->addOption($img);
		}
        $fieldImage->value = $data['useField'];
        //$fieldTemplate->notes = "Number of pages " . count($reminders) . ".";
		$inputfields->add($fieldImage); 

		$fieldSize = $modules->get("InputfieldInteger");
		$fieldSize->name = "sizeField";
		$fieldSize->label = __("Maximum allowed width in pixels for images uploaded from Unsplash");
		$fieldSize->value = $data["sizeField"];
		$inputfields->add($fieldSize);


		return $inputfields;


	}
}