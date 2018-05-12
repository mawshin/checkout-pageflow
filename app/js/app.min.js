// JavaScript Document

/* Create a closure to maintain scope of the '$' and remain compatible with other frameworks.  */
(function ($) {

	// *************************************************************************************************** //
	// *************************************************************************************************** //
	// begin: same as $(document).ready(); event fires when the DOM is ready                               //
	// *************************************************************************************************** //
	// *************************************************************************************************** //
	$(function () {
		
		
		$(function () {
			var modal = $('.modal');

			if($('.jsCarouselSlide').length > 0) {
				$('.modal-backdrop').click(function(e) {
					$modal.hide();
				});

				$('.c-modal--close').click(function(e) {
					modal.hide();
				});

				$('.jsCarouselSlide').click(function(e) {
					$('#captionModal').show();
					caption = $(this).find('img').attr('aria-describedby');
					$('.c-slider--caption').text(caption);
				});

			}
			
		});
		
	});
	// end: bind window resize

})(jQuery);
/* =End closure */