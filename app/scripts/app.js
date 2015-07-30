(function(window, $, undefined) {
  "use strict";

  var appContext = $("[data-app-name='Protein-App']");
  //var input = "3702";
  /* Generate Agave API docs */
  window.addEventListener("Agave::ready", function() {
    var Agave = window.Agave;

    /*var showResponse = function showResponse(response) {
      var data = response.obj || response;
      $(".response", appContext ).html("<pre><code>" + JSON.stringify(data, null, 2 ) + "</code></pre>");
    };*/

    //shows a table of all proteins
    var showProteinList = function(json) {
      // Creates a string of html to place into the document
      // This starts off the html for the table, with headers and classes that will
      // work with Datatables
      var html =
      "<table class='table display' width='100%'>"+
          "<thead><tr>"+
            "<th>Protein Identifier</th><th>More Information</th>"+
            "</tr></thead>";
      // Loops through every protein of the returned json
      for (var i = 0; i < json.obj.result[0].length; i++) {
        // Sets entry as the result
        var entry = json.obj.result[0][i];
        // adds the html for one row in the table
        //First column is just the protein identifier
        html += "<tr><td>" + entry +
          //Second column is a button to show more information about the protein
          "<a role='button' data-toggle='collapse' href='#" + entry.pathway_id +
          "'aria-expanded='false' aria-controls='" + entry.pathway_id + "' id='b" + entry.pathway_id + "'>" +
          "<span class='glyphicon glyphicon-collapse-down' aria-hidden='true'></a></td>" +
          // The div holds the area that will be expanded, and is given the id of just the pathway ID (e.g. "00010")
          "<div id='" + entry + "' class='proteinInfo collapse'>Loading...</div></div></td>";
      }
      html += "</tbody></table>";

      // This is called whenever the additional info for a pathway is called to expand
      $('.proteinInfo', appContext).on('show.bs.collapse', function() {

        // Gets the id of the area being expanded (which is the same as the entry which is the protein identifier)
        var id = $(this).attr('id');
        // Sets data as the current object so it can be used later when it is no longer the current object
        //var data = $(this);

        // This function is called to show the data received about a specific protein
        var showProteinInfo = function(json) {
          html = "<br><ul class-'list-unstyled'>";
          for (var key in json) {
            html += "<li><b>" + key + "</b>: " + json.obj.result.key + "</li>\n";
          }
        };

        // We just finished the function that handles displaying the return info
        // from Adama if pathway info is requested. The function will only be called
        // after Adama has retrieved the information. This is true for all functions referenced
        // in calls to Adama

        var params = {Identifier: id, Output: "all"};
        Agave.api.adama.search(
          {namespace: "jk-dev", service: "protein_api_v0.1", queryParams: params},
          showProteinInfo,
          showSearchError
        );
        // Sets the button that show pathway info from expand to collapse
        $("#b" + id, appContext).html('<span class="glyphicon glyphicon-collapse-up" aria-hidden="true">');
      });


      $(".data", appContext).empty().html(html);


      // This is called when the area holding pathway info is called to collapse
      $('.pinfo', appContext).on('hide.bs.collapse', function() {
        // Gets the id of the area
        var id = $(this).attr('id');
        // Sets the button that show pathway info from collapse to expand
        $('#b'+id, appContext).html('<span class="glyphicon glyphicon-collapse-down" aria-hidden="true">');
      });
    };

    // This displays an error when Adama fails
    var showSearchError = function(json) {
      // Displays the error on the Javascript console
      console.error("Search returned error! Status=" + json.obj.status + " Message=" + json.obj.message);
      // Creates an error alert on the page
      console.log(json);
      var html = "<div class='alert alert-danger' role='alert'>" + json.obj.message + "</div>";
      $("#error", appContext).html(html);
    };
    /*
    var params = {
      Identifier: "AT4G09000.1",
      Output: "all"
    };
    */
    Agave.api.adama.list(
      {namespace: "jk-dev", service: "protein_api_v0.1"},
      showProteinList,
      showSearchError
    );
  });

})(window, jQuery);
