/* global _ */
/* global moment */
/* jshint camelcase: false */
(function(window, $, _, moment, undefined) {
    'use strict';
    var appContext = $('[data-app-name="protein-app"]');

    // Only runs once Agave is ready
    window.addEventListener('Agave::ready', function() {
        var Agave = window.Agave;

        var templates = {
            summaryTable: _.template('<table class="table table-bordered">' +
                                     '<thead></thead><tbody>' +
                                     '<tr><th class="row-header">Protein ID</th><td><%= protein_id %></td></tr>' +
                                     '<tr><th class="row-header">Name</th><td><%= name %></td></tr>' +
                                     '<tr><th class="row-header">Source</th><td><%= source %></td></tr>' +
                                     '<tr><th class="row-header">Length</th><td><%= length %></td></tr>' +
                                     '<tr><th class="row-header">Molecular Weight</th><td><%= molecular_weight %></td></tr>' +
                                     '<tr><th class="row-header">UniProt Accession</th><td><%= uniprot_accession %></td></tr>' +
                                     '<tr><th class="row-header">UniProt Name</th><td><%= uniprot_name %></td></tr>' +
                                     '<tr><th class="row-header">Is UniProt Canonical?</th><td><%= is_uniprot_canonical %></td></tr>' +
                                     '<tr><th class="row-header">Is Fragment?</th><td><%= is_fragment %></td></tr>' +
                                     '<tr><th class="row-header">Primary Accession</th><td><%= primary_accession %></td></tr>' +
                                     '<tr><th class="row-header">Secondary Identifier</th><td><%= secondary_identifier %></td></tr>' +
                                     '<tr><th class="row-header">Synonyms</th><td>' +
                                     '<%= s.join(", ", synonyms) %>' +
                                     '</td></tr>' +
                                     '<tr><th class="row-header">Keywords</th><td>' +
                                     '<%= s.join(", ", keywords) %>' +
                                     '</td></tr>' +
                                     '</tbody></table>')
        };

        var errorMessage = function errorMessage(message) {
            return '<div class="alert alert-danger fade in" role="alert">' +
                   '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
                   '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">Error:</span> ' +
                   message + '</div>';
        };

        var warningMessage = function warningMessage(message) {
            return '<div class="alert alert-warning fade in" role="alert">' +
                   '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
                   '<span class="glyphicon glyphicon-warning-sign" aria-hidden="true"></span><span class="sr-only">Warning:</span> ' +
                   message + '</div>';
        };

        // Displays an error message if the API returns an error
        var showErrorMessage = function showErrorMessage(response) {
            // clear progress bar and spinners
            $('#progress_region', appContext).addClass('hidden');
            $('#summary_ident', appContext).empty();
            console.error('Status: ' + response.obj.status + ' Message: ' + response.obj.message);
            $('#error', appContext).html(errorMessage('API Error: ' + response.obj.message));
        };

        var showSummaryTable = function showSummaryTable(json) {
            $('#progress_region', appContext).addClass('hidden');
            $('#summary_ident', appContext).empty();
            if ( ! (json && json.obj) || json.obj.status !== 'success') {
                $('#error', appContext).html(errorMessage('Invalid response from server!'));
                return;
            }

            $('a[href="#protein_summary"]', appContext).tab('show');

            if (json.obj.result[0]) {
                $('#protein_summary_results', appContext).html(templates.summaryTable(json.obj.result[0]));
            } else {
                $('#protein_summary_results', appContext).html('');
                var search_ident = $('#protein_id', appContext).val();
                $('#error', appContext).html(warningMessage('No results found for protein identifier \'' + search_ident + '\'. Please try again.'));
            }

            $('#summary_ident', appContext).html(' ' + json.obj.result[0].protein_id);
        };

        // controls the clear button
        $('#clearButton', appContext).on('click', function () {
            // clear the gene field
            $('#protein_id', appContext).val('');
            // clear the error section
            $('#error', appContext).empty();
            // clear the number of result rows from the tabs
            $('#progress_region', appContext).addClass('hidden');
            $('#summary_ident', appContext).empty();
            // clear the tables
            $('#protein_summary_results', appContext).html('<h4>Please search for a protein.</h4>');
            // select the about tab
            $('a[href="#about"]', appContext).tab('show');
        });


        // search form
        $('#proteinSearch', appContext).submit(function(event) {
            event.preventDefault();

            // Reset error div
            $('#error', appContext).empty();

            // Inserts loading text, will be replaced by table
            $('#protein_summary_results', appContext).html('<h4>Loading summary information...</h4>');

            // start progress bar and tab spinners
            $('#progress_region', appContext).removeClass('hidden');
            $('#summary_ident', appContext).html('<i class="fa fa-refresh fa-spin"></i>');

            var params = {
                identifier: this.protein_id.value,
                source: 'UniProt'
            };

            // Calls ADAMA adapter to retrieve gene summary data
            Agave.api.adama.search({
                'namespace': 'araport',
                'service': 'protein_summary_by_identifier_v0.1',
                'queryParams': params
            }, showSummaryTable, showErrorMessage);
        });
    });
})(window, jQuery, _, moment);
