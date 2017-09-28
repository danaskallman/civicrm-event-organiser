/**
 * CiviCRM Event Organiser "Manual Sync" Javascript.
 *
 * Implements sync functionality on the plugin's "Manual Sync" admin pages.
 *
 * @package CiviCRM_Event_Organiser
 */

/**
 * Create CiviCRM Event Organiser "Manual Sync" object.
 *
 * This works as a "namespace" of sorts, allowing us to hang properties, methods
 * and "sub-namespaces" from it.
 *
 * @since 0.2.4
 */
var CiviCRM_Event_Organiser_Manual_Sync = CiviCRM_Event_Organiser_Manual_Sync || {};



/**
 * Pass the jQuery shortcut in.
 *
 * @since 0.2.4
 *
 * @param {Object} $ The jQuery object.
 */
( function( $ ) {

	/**
	 * Create Settings Singleton.
	 *
	 * @since 0.2.4
	 */
	CiviCRM_Event_Organiser_Manual_Sync.settings = new function() {

		// prevent reference collisions
		var me = this;

		/**
		 * Initialise Settings.
		 *
		 * This method should only be called once.
		 *
		 * @since 0.2.4
		 */
		this.init = function() {

			// init localisation
			me.init_localisation();

			// init settings
			me.init_settings();

		};

		/**
		 * Do setup when jQuery reports that the DOM is ready.
		 *
		 * This method should only be called once.
		 *
		 * @since 0.2.4
		 */
		this.dom_ready = function() {

		};

		// init localisation array
		me.localisation = [];

		/**
		 * Init localisation from settings object.
		 *
		 * @since 0.2.4
		 */
		this.init_localisation = function() {
			if ( 'undefined' !== typeof CiviCRM_Event_Organiser_Settings ) {
				me.localisation = CiviCRM_Event_Organiser_Settings.localisation;
			}
		};

		/**
		 * Getter for localisation.
		 *
		 * @since 0.2.4
		 *
		 * @param {String} The identifier for the desired localisation string.
		 * @return {String} The localised string.
		 */
		this.get_localisation = function( key, identifier ) {
			return me.localisation[key][identifier];
		};

		// init settings array
		me.settings = [];

		/**
		 * Init settings from settings object.
		 *
		 * @since 0.2.4
		 */
		this.init_settings = function() {
			if ( 'undefined' !== typeof CiviCRM_Event_Organiser_Settings ) {
				me.settings = CiviCRM_Event_Organiser_Settings.settings;
			}
		};

		/**
		 * Getter for retrieving a setting.
		 *
		 * @since 0.2.4
		 *
		 * @param {String} The identifier for the desired setting.
		 * @return The value of the setting.
		 */
		this.get_setting = function( identifier ) {
			return me.settings[identifier];
		};

	};

	/**
	 * Create Progress Bar Class.
	 *
	 * @since 0.2.4
	 *
	 * @param {Object} options The setup options for the object.
	 */
	function ProgressBar( options ) {

		// private var prevents reference collisions
		var me = this;

		// assign properties
		me.bar = $(options.bar);
		me.label = $(options.label);

		// assign labels
		me.label_init = CiviCRM_Event_Organiser_Manual_Sync.settings.get_localisation( options.key, 'total' );
		me.label_current = CiviCRM_Event_Organiser_Manual_Sync.settings.get_localisation( options.key, 'current' );
		me.label_complete = CiviCRM_Event_Organiser_Manual_Sync.settings.get_localisation( options.key, 'complete' );
		me.label_done = CiviCRM_Event_Organiser_Manual_Sync.settings.get_localisation( 'common', 'done' );

		// get count
		me.count = CiviCRM_Event_Organiser_Manual_Sync.settings.get_localisation( options.key, 'count' );

		// the triggering button
		me.button = $(options.button);

		// the step setting
		me.step = options.step;

		// the WordPress AJAX mthod token
		me.action = options.action;

		/**
		 * Add a click event listener to start sync.
		 *
		 * @param {Object} event The event object.
		 */
		me.button.on( 'click', function( event ) {

			// prevent form submission
			if ( event.preventDefault ) {
				event.preventDefault();
			}

			// initialise progress bar
			me.bar.progressbar({
				value: false,
				max: me.count
			});

			// show progress bar if not already shown
			me.bar.show();

			// initialise progress bar label
			me.label.html( me.label_init.replace( '{{total}}', me.count ) );

			// send
			me.send();

		});

		/**
		 * Send AJAX request.
		 *
		 * @since 0.2.4
		 *
		 * @param {Array} data The data received from the server.
		 */
		this.update = function( data ) {

			// declare vars
			var val;

			// are we still in progress?
			if ( data.finished == 'false' ) {

				// get current value of progress bar
				val = me.bar.progressbar( 'value' ) || 0;

				// update progress bar label
				me.label.html(
					me.label_complete.replace( '{{from}}', data.from ).replace( '{{to}}', data.to )
				);

				// update progress bar
				me.bar.progressbar( 'value', val + CiviCRM_Event_Organiser_Manual_Sync.settings.get_setting( me.step ) );

				// trigger next batch
				me.send();

			} else {

				// update progress bar label
				me.label.html( me.label_done );

				// hide the progress bar
				setTimeout(function () {
					me.bar.hide();
				}, 2000 );

			}

		};

		/**
		 * Send AJAX request.
		 *
		 * @since 0.2.4
		 */
		this.send = function() {

			// use jQuery post
			$.post(

				// URL to post to
				CiviCRM_Event_Organiser_Manual_Sync.settings.get_setting( 'ajax_url' ),

				{

					// token received by WordPress
					action: me.action

				},

				// callback
				function( data, textStatus ) {

					// if success
					if ( textStatus == 'success' ) {

						// update progress bar
						me.update( data );

					} else {

						// show error
						if ( console.log ) {
							console.log( textStatus );
						}

					}

				},

				// expected format
				'json'

			);

		};

	};

	/**
	 * Create Progress Bar Singleton.
	 *
	 * @since 0.2.4
	 */
	CiviCRM_Event_Organiser_Manual_Sync.progress_bar = new function() {

		// prevent reference collisions
		var me = this;

		/**
		 * Initialise Progress Bar.
		 *
		 * This method should only be called once.
		 *
		 * @since 0.2.4
		 */
		this.init = function() {

		};

		/**
		 * Do setup when jQuery reports that the DOM is ready.
		 *
		 * This method should only be called once.
		 *
		 * @since 0.2.4
		 */
		this.dom_ready = function() {

			// set up instance
			me.setup();

		};

		/**
		 * Set up Progress Bar instances.
		 *
		 * @since 0.2.4
		 */
		this.setup = function() {

			// EO Category Terms to CiviCRM Event Types
			me.tax_eo_to_civi = new ProgressBar({
				bar: '#progress-bar-tax-eo-to-civi',
				label: '#progress-bar-tax-eo-to-civi .progress-label',
				key: 'categories',
				button: '#civi_eo_tax_eo_to_civi',
				step: 'step_tax',
				action: 'sync_categories_to_types'
			});

			// CiviCRM Event Types to EO Category Terms
			me.tax_civi_to_eo = new ProgressBar({
				bar: '#progress-bar-tax-civi-to-eo',
				label: '#progress-bar-tax-civi-to-eo .progress-label',
				key: 'event_types',
				button: '#civi_eo_tax_civi_to_eo',
				step: 'step_tax',
				action: 'sync_types_to_categories'
			});

			// EO Venues to CiviCRM Locations
			me.venue_eo_to_civi = new ProgressBar({
				bar: '#progress-bar-venue-eo-to-civi',
				label: '#progress-bar-venue-eo-to-civi .progress-label',
				key: 'venues',
				button: '#civi_eo_venue_eo_to_civi',
				step: 'step_venue',
				action: 'sync_venues_to_locations'
			});

			// CiviCRM Locations to EO Venues
			me.venue_civi_to_eo = new ProgressBar({
				bar: '#progress-bar-venue-civi-to-eo',
				label: '#progress-bar-venue-civi-to-eo .progress-label',
				key: 'locations',
				button: '#civi_eo_venue_civi_to_eo',
				step: 'step_venue',
				action: 'sync_locations_to_venues'
			});

			// EO Events to CiviCRM Events
			me.event_eo_to_civi = new ProgressBar({
				bar: '#progress-bar-event-eo-to-civi',
				label: '#progress-bar-event-eo-to-civi .progress-label',
				key: 'eo_events',
				button: '#civi_eo_event_eo_to_civi',
				step: 'step_event',
				action: 'sync_events_eo_to_civi'
			});

			// CiviCRM Events to EO Events
			me.event_civi_to_eo = new ProgressBar({
				bar: '#progress-bar-event-civi-to-eo',
				label: '#progress-bar-event-civi-to-eo .progress-label',
				key: 'civi_events',
				button: '#civi_eo_event_civi_to_eo',
				step: 'step_event',
				action: 'sync_events_civi_to_eo'
			});

		};

	};

	// init settings
	CiviCRM_Event_Organiser_Manual_Sync.settings.init();

	// init Progress Bar
	CiviCRM_Event_Organiser_Manual_Sync.progress_bar.init();

} )( jQuery );



/**
 * Trigger dom_ready methods where necessary.
 *
 * @since 0.2.4
 */
jQuery(document).ready(function($) {

	// The DOM is loaded now
	CiviCRM_Event_Organiser_Manual_Sync.settings.dom_ready();

	// The DOM is loaded now
	CiviCRM_Event_Organiser_Manual_Sync.progress_bar.dom_ready();

}); // end document.ready()



