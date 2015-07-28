(function(window, $, undefined) {
  'use strict';

  var appContext = $('[data-app-name="Protein-App"]');

  /* Generate Agave API docs */
  window.addEventListener('Agave::ready', function() {
    var Agave = window.Agave;

    var showResponse = function showResponse(response) {
      var data = response.obj || response;
      $('.response', appContext ).html('<pre><code>' + JSON.stringify(data, null, 2 ) + '</code></pre>');
    };

    var showProteinInfo = function showProteinInfo(response) {
      var data = response.obj || response;
      $('.response', appContext ).html('<pre><code>' + JSON.stringify(data, null, 2 ) + '</code></pre>');//replace
    };

    // This displays an error when Adama fails
    var showSearchError = function(json) {
      // Displays the error on the Javascript console
      console.error('Search returned error! Status=' + json.obj.status + ' Message=' + json.obj.message);
      // Creates an error alert on the page
      console.log(json);
      var html = '<div class="alert alert-danger" role="alert">' + json.obj.message + '</div>';
      $('#error', appContext).html(html);
    };

    var params = {
      Identifier: 'AT4G09000.1',
      Output: 'all'
    };

    Agave.api.adama.search(
      {namespace: 'jk-dev', service: 'protein_api_v0.1', queryParams: params},
      showProteinInfo,
      showSearchError
    );
  });

})(window, jQuery);
