(function(window, $, undefined) {
  "use strict";

  var appContext = $("[data-app-name='Protein-App']");
  //var input = "3702";
  /* Generate Agave API docs */
  window.addEventListener("Agave::ready", function() {
    var Agave = window.Agave;

    /*var showResponse = function showResponse(response) {
      var data = response.obj || response;
      $(".response", appContext ).html("<pre><code>" + JSON.stringify(data, null, 2) + "</code></pre>");
    };*/

    //shows a table of all proteins
    var showProteinList = function(json) {
      // Creates a string of html to place into the document
      // This starts off the html for the table, with headers and classes that will
      // work with Datatables
      var html =
      "<table class='table table-striped' width='100%'>"+
          "<thead><tr><th>Protein Identifier</th><th>Protein Name</th><th>More Information</th></tr></thead><tbody>";
      // Loops through every protein of the returned json
      for (var i = 0; i < json.obj.result.length; i++) {
        // Sets entry as the result
        var entry = json.obj.result[i]["mRNA.primaryIdentifier"];
        var entryName = json.obj.result[i].name;
        // adds the html for one row in the table
        //First column is just the protein identifier
        html += "<tr><td>" + entry + "</td><td>" + entryName + "</td>" +
          //Second column is a button to show more information about the protein
          "<td><button type='button' class='btn btn-default btn-xs' id='more" + entry + "'>Show more information</button></td></tr>" +
          // The div holds the area that will be expanded, and its id is the protein identifier
          "<div id='" + entry + "' class='proteinInfo collapse' data-toggle='collapse'>Loading...</div>";
      }
      html += "</tbody></table>";
      $(".data", appContext).html(html);

      // This is called whenever one of the buttons is pressed
      $(".btn", appContext).click(function() {
        // Gets the id of the button pressed (which is either "more" + proteinIdentifier or "less" + proteinIdentifier)
        var buttonId = $(this).attr("id");
        var identifier = buttonId.substring(4);
        // Sets data as the current object so it can be used later when it is no longer the current object
        var data = $("div[id='" + identifier + "']", appContext);
        if ($(this).attr("id").substring(0,4) === "more") {
          // This function is called to show the data received about a specific protein
          var showProteinInfo = function(json) {
            var html = "<br><ul class-'list-unstyled'>";
            var results = json.obj.result;
            for (var proteinCounter = 0; proteinCounter < results.length; proteinCounter++) {
              var protein = results[proteinCounter];
              for (var property in protein) {
                html += "<li><b>" + property + "</b>: " + protein[property] + "</li>\n";
              }
              html += "<br>";
            }
            html += "</ul>";
            data.html(html);
          };

          // We just finished the function that handles displaying the return info
          // from Adama if protein info is requested. The function will only be called
          // after Adama has retrieved the information. This is true for all functions referenced
          // in calls to Adama

          var params = {Identifier: identifier, Output: "all"};
          Agave.api.adama.search(
            {namespace: "jk-dev", service: "protein_api_v0.1", queryParams: params},
            showProteinInfo,
            showSearchError
          );
          // Sets the button that show protein info from expand to collapse
          $(this).html("Show less information");
          $(this).attr("id", "less" + identifier);
          data.appendTo($(this).parent().prev());
          data.show(500);
        }
        else {
          // Sets the button that show protein info from collapse to expand
          $(this).html("Show more information");
          $(this).attr("id", "more" + identifier);
          data.hide(500);
        }
      });
      $(".data table", appContext).dataTable({"columnDefs": [{"targets": 2, "orderable": false, "searchable": false}]});
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


    Agave.api.adama.list(
      {namespace: "jk-dev", service: "protein_api_v0.1"},
      showProteinList,
      showSearchError
    );
  });

})(window, jQuery);
