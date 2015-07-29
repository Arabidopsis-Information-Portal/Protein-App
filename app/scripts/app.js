(function(window, $, undefined) {
  "use strict";

  var appContext = $("[data-app-name='Protein-App']");

  /* Generate Agave API docs */
  window.addEventListener("Agave::ready", function() {
    var Agave = window.Agave;

    /*var showResponse = function showResponse(response) {
      var data = response.obj || response;
      $(".response", appContext ).html("<pre><code>" + JSON.stringify(data, null, 2 ) + "</code></pre>");
    };*/

    //shows a table of all proteins
    var showProteinInfo = function showProteinInfo(json) {
      // Creates a string of html to place into the document
      // This starts off the html for the table, with headers and classes that will
      // work with Datatables
      var html =
      "<table class='table display' width='100%'>"+
          "<thead><tr>"+
            "<th>Protein Identifier</th> <th>Protein Name</th> <th>Pathway Map</th>"+
            "</tr></thead>";
      // Loops through every protein of the returned json
      for (var i = 0; i < json.obj.result[0].length; i++) {
        // Sets entry as the result
        var entry = json.obj.result[0][i];
        console.log(entry);
        // adds the html for one row in the table
        //First column is just the protein identifier
        html += "<tr><td>" + entry +
          //Second column is a button to show more information about the protein
          "<a role='button' data-toggle='collapse' href='#" + entry.pathway_id +
          "'aria-expanded='false' aria-controls='" + entry.pathway_id + "' id='b" + entry.pathway_id + "'>" +
          "<span class='glyphicon glyphicon-collapse-down' aria-hidden='true'></a></td>" +
          // The div holds the area that will be expanded, and is given the id of just the pathway ID (e.g. "00010")
          "<div id='" + entry.pathway_id + "' class='pinfo collapse'>Loading...</div></div></td>";
      }
      html += "</tbody></table>";

      // This is called whenever the additional info for a pathway is called to expand
      $('.pinfo', appContext).on('show.bs.collapse', function() {

        // Gets the id of the area being expanded (which is the same as the pathway_id)
        var id = $(this).attr('id');
        // Sets data as the current object so it can be used later when it is no longer the current object
        var data = $(this);

        // This function is called to show the data received about a specific protein
        var showPathwayInfo = function(json) {
          // Gets the pathway
          var results = json.obj.result[0];
          // Gets all the fields of the object that has the pathwya info
          var fields = Object.keys(results);
          // This is the order that the fields should be displayed in for the table
          var order = ['description', 'class', 'organism'];
          // Creates html to put in the expandable container. This starts a description list
          var html = '<br><ul class="list-unstyled">';
          // Loops through all elements in the order array and gets that field in the object (if it exists)
          var flag = false;
          for (var i = 0; i < order.length; i++) {
            if (fields.indexOf(order[i]) !== -1) {
              // Adds html to display the info for the current field
              html += '<li><b>' + order[i] + '</b>: ' + results[order[i]] + '</li>\n';
              flag = true;
            }
          }
          if (flag===false) {
            html += '<li>No information</li>';
          }
          // If organism is a field (the pathway is organism specific), add an entry of the list
          // that would allow the user to display the list of genes
          if (fields.indexOf('organism') !== -1) {
            // Displays Genes and a button with a unique id g + pathway ID (e.g. "g00010")
            // This button controls another expandable field.
            html += '<li><b><button href="#" class="btn btn-default btn-xs genelink" id="'+ id + '-link">Show genes </b></li>\n';

            //Ends the list
            html += '</ul>';
            // Puts the html in the document
            data.html(html);

            $('.genelink', appContext).click(function(){
              var id = $(this).attr('id');
              id = id.substring(0, id.length - 5);
              console.log(id);
              $('#geneTaxonId', appContext).val(input);
              $('#pathwayId', appContext).val(id);
              $('#genetab', appContext).tab('show');
              $('form[name=gene-form]', appContext).submit();

            });

          } else { // Not an organism specific pathway

            html += '<li><b><button href="#" class="btn btn-default btn-xs genelink" id="'+ id + '-link">Show KEGG orthology genes</b></li>\n';

            //Ends the list
            html += '</ul>';
            // Puts the html in the document
            data.html(html);

            $('.genelink', appContext).click(function(){
              var id = $(this).attr('id');
              id = id.substring(0, id.length - 5);
              console.log(id);
              $('#geneTaxonId', appContext).val('');
              $('#pathwayId', appContext).val(id);
              $('#genetab', appContext).tab('show');
              $('form[name=gene-form]', appContext).submit();

            });
          }
        };

        // We just finished the function that handles displaying the return info
        // from Adama if pathway info is requested. The function will only be called
        // after Adama has retrieved the information. This is true for all functions referenced
        // in calls to Adama

        // Creates the parameters to query Adama with.
        var query;
        if (input === '') {
          query = {'pathway_id':id};
        } else {
          query = {'pathway_id':id, 'taxon_id': input};
        }

        // Calls Adama for the pathway info
        if ($(this, appContext).html() === 'Loading...') {
          Agave.api.adama.search(
                    {'namespace': 'kegg',
               'service': 'kegg_pathways_v0.3',
               'queryParams': query},
              showPathwayInfo, //Calls showPathwayInfo with the results if call is successful
              showSearchError // Calls showSearchError if call fails
                );
        }
        // Sets the button that show pathway info from expand to collapse
        $('#b' + id, appContext).html('<span class="glyphicon glyphicon-collapse-up" aria-hidden="true">');
      });
      $(".data", appContext).empty().html(html);
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
      showProteinInfo,
      showSearchError
    );

    //reads the information about a single protein in a JSON
    var getSingleProtein = function(json) {
      $('#error', appContext).empty();
      // JavaScript === and !== operators test value and type.
      if (json.obj.status !== 'success') {
          console.log('Search result status is NOT good!');
          return (false);
      }
    };

    // This function is called when the taxon form is submitted
      $("form[name=protein_form]", appContext).on("submit", function(e) {
        // Prevents the button from default trying to POST
        e.preventDefault();

        // Sets the document to display Reloading
        $(".data", appContext).html("Loading...");

        // Removes the error message if it exists
        $("#error", appContext).empty();

        // Gets the input and saves it
        var input = this.protIdentifier.value;

        // Creates parameters to call Adama with
        var query = {
          "Identifier": input,
        };

        // If the taxon field was empty, give no parameters to Adama
        if (input === "") {
          query = {};
        }

        // Calls Adama
        Agave.api.adama.search(
          {namespace: "jk-dev", service: "protein_api_v0.1", queryParams: query},
          getSingleProtein,
          showSearchError
        );
      });
  });

})(window, jQuery);
