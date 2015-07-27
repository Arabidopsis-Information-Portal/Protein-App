(function(window, $, undefined) {
  'use strict';

  console.log('Hello, my science app!');

  var appContext = $('[data-app-name="Protein-App"]');

  /* Generate Agave API docs */
  window.addEventListener('Agave::ready', function() {
    var Agave = window.Agave;

    var showResponse = function showResponse( response ) {
      var data = response.obj || response;
      $( '.response', appContext ).html( '<pre><code>' + JSON.stringify( data, null, 2 ) + '</code></pre>' );
    };

    var params = {
      Identifier: 'AT4G09000.1',
      Output: 'all'
    };

    Agave.api.adama.search(
      { namespace: 'jk-dev', service: 'protein_api_v0.1', queryParams: params},
      showResponse
    );
  });

})(window, jQuery);
