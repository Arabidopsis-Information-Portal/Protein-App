/* global _ */
/* global moment */
/* jshint camelcase: false */
(function(window, $, _, moment, undefined) {
    'use strict';
    var appContext = $('[data-app-name="protein-app"]');
    var default_tab_text = 'Please enter an identifier above to search for protein data.';

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
                                     '</tbody></table>'),
            commentsTable: _.template('<table class="table table-bordered table-striped">' +
                                      '<thead><tr>' +
                                      '<th>Type</th>' +
                                      '<th>Description</th>' +
                                      '</tr></thead><tbody>' +
                                      '<% _.each(result, function(r) { %>' +
                                      '<tr>' +
                                      '<td><%= r.comment_type %></td>' +
                                      '<td><%= r.comment_description %></td>' +
                                      '</tr>' +
                                      '<% }) %>' +
                                      '</tbody></table>'),
            featuresTable: _.template('<table class="table table-bordered table-striped">' +
                                      '<thead><tr>' +
                                      '<th>Type</th>' +
                                      '<th>Start</th>' +
                                      '<th>End</th>' +
                                      '<th>Description</th>' +
                                      '</tr></thead><tbody>' +
                                      '<% _.each(result, function(r) { %>' +
                                      '<tr>' +
                                      '<td><%= r.feature_type %></td>' +
                                      '<td><%= r.feature_start %></td>' +
                                      '<td><%= r.feature_end %></td>' +
                                      '<td><%= r.feature_description %></td>' +
                                      '</tr>' +
                                      '<% }) %>' +
                                      '</tbody></table>'),
            regionsTable: _.template('<table class="table table-bordered table-striped">' +
                                     '<thead><tr>' +
                                     '<th>Identifier</th>' +
                                     '<th>Start</th>' +
                                     '<th>End</th>' +
                                     '<th>Database</th>' +
                                     '</tr></thead><tbody>' +
                                     '<% _.each(result, function(r) { %>' +
                                     '<tr>' +
                                     '<td><%= r.protein_domain_region_id %></td>' +
                                     '<td><%= r.protein_domain_region_start %></td>' +
                                     '<td><%= r.protein_domain_region_end %></td>' +
                                     '<td><%= r.protein_domain_region_db %></td>' +
                                     '</tr>' +
                                     '<% }) %>' +
                                     '</tbody></table>'),
            publicationTable: _.template('<table class="table table-bordered table-striped">' +
                                         '<thead><tr>' +
                                         '<th>Author</th>' +
                                         '<th>Date</th>' +
                                         '<th>Title</th>' +
                                         '<th>Journal</th>' +
                                         '<th>Issue</th>' +
                                         '<th>Volume</th>' +
                                         '<th>Pages</th>' +
                                         '<th>PubMed Id</th>' +
                                         '</tr></thead><tbody>' +
                                         '<% _.each(result, function(r) { %>' +
                                         '<tr>' +
                                         '<td><%= r.first_author %></td>' +
                                         '<td><%= r.year %></td>' +
                                         '<td><%= r.title %></td>' +
                                         '<td><%= r.journal %></td>' +
                                         '<td><%= r.issue %></td>' +
                                         '<td><%= r.volume %></td>' +
                                         '<td><%= r.pages %></td>' +
                                         '<td><a href="http://www.ncbi.nlm.nih.gov/pubmed/<%= r.pubmed_id %>" target="_blank"><span class="cell-expand"><%= r.pubmed_id %> <i class="fa fa-external-link"></i></a></td>' +
                                         '</tr>' +
                                         '<% }) %>' +
                                         '</tbody>' +
                                         '</table>')
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
            $('#comments_num_rows', appContext).empty();
            $('#features_num_rows', appContext).empty();
            $('#regions_num_rows', appContext).empty();
            $('#pub_num_rows', appContext).empty();
            console.error('Status: ' + response.obj.status + ' Message: ' + response.obj.message);
            $('#error', appContext).html(errorMessage('API Error: ' + response.obj.message));
        };

        var disableForm = function disableForm() {
            var search_button = $('#searchButton', appContext);
            search_button.html('<i class="fa fa-refresh fa-spin"></i> Searching...');
            search_button.prop('disabled', true);
            $('#protein_id', appContext).prop('disabled', true);
            $('#datasource1', appContext).prop('disabled', true);
            $('#datasource2', appContext).prop('disabled', true);
            $('#clearButton', appContext).prop('disabled', true);
        };

        var enableForm = function enableForm() {
            var search_button = $('#searchButton', appContext);
            search_button.html('Search');
            search_button.prop('disabled', false);
            $('#protein_id', appContext).prop('disabled', false);
            $('#datasource1', appContext).prop('disabled', false);
            $('#datasource2', appContext).prop('disabled', false);
            $('#clearButton', appContext).prop('disabled', false);
        };

        var showSummaryTable = function showSummaryTable(json) {
            $('#progress_region', appContext).addClass('hidden');
            $('#summary_ident', appContext).empty();
            if ( ! (json && json.obj) || json.obj.status !== 'success') {
                $('#error', appContext).html(errorMessage('Invalid response from server!'));
                return;
            }

            $('a[href="#protein_summary"]', appContext).tab('show');
            enableForm();

            if (json.obj.result[0]) {
                $('#protein_summary_results', appContext).html(templates.summaryTable(json.obj.result[0]));
            } else {
                $('#protein_summary_results', appContext).html('');
                var search_ident = $('#protein_id', appContext).val();
                $('#error', appContext).html(warningMessage('No results found for protein identifier \'' + search_ident + '\'. Please try again.'));
            }

            $('#summary_ident', appContext).html(' ' + json.obj.result[0].protein_id);
        };

        var showCommentsTable = function showCommentsTable(json) {
            $('#comments_num_rows', appContext).empty();
            if ( ! (json && json.obj) || json.obj.status !== 'success') {
                $('#error', appContext).html(errorMessage('Invalid response from server!'));
                return;
            }

            var filename = 'Comments_for_';
            if (json.obj.result[0]) {
                filename += json.obj.result[0].protein_id;
            } else {
                filename += $('#protein_id', appContext).val();
            }
            $('#protein_comments_results', appContext).html(templates.commentsTable(json.obj));
            var commentsTable = $('#protein_comments_results table', appContext).DataTable( {'lengthMenu': [10, 25, 50, 100],
                                                                                         'language': {
                                                                                             'emptyTable': 'No curated comments available for this protein id.'
                                                                                         },
                                                                                         'buttons': [{'extend': 'csv', 'title': filename},
                                                                                                     {'extend': 'excel', 'title': filename},
                                                                                                     'colvis'],
                                                                                         'colReorder': true,
                                                                                         'dom': '<"row"<"col-sm-6"l><"col-sm-6"f<"button-row"B>>><"row"<"col-sm-12"tr>><"row"<"col-sm-5"i><"col-sm-7"p>>'
                                                                                        } );

            $('#comments_num_rows', appContext).html(' ' + commentsTable.data().length);
        };

        var showFeaturesTable = function showFeaturesTable(json) {
            $('#features_num_rows', appContext).empty();
            if ( ! (json && json.obj) || json.obj.status !== 'success') {
                $('#error', appContext).html(errorMessage('Invalid response from server!'));
                return;
            }

            var filename = 'Features_for_';
            if (json.obj.result[0]) {
                filename += json.obj.result[0].protein_id;
            } else {
                filename += $('#protein_id', appContext).val();
            }
            $('#protein_features_results', appContext).html(templates.featuresTable(json.obj));
            var featureTable = $('#protein_features_results table', appContext).DataTable( {'lengthMenu': [10, 25, 50, 100],
                                                                                         'language': {
                                                                                             'emptyTable': 'No feature data available for this protein id.'
                                                                                         },
                                                                                         'buttons': [{'extend': 'csv', 'title': filename},
                                                                                                     {'extend': 'excel', 'title': filename},
                                                                                                     'colvis'],
                                                                                         'order' : [[ 1, 'asc' ]],
                                                                                         'colReorder': true,
                                                                                         'dom': '<"row"<"col-sm-6"l><"col-sm-6"f<"button-row"B>>><"row"<"col-sm-12"tr>><"row"<"col-sm-5"i><"col-sm-7"p>>'
                                                                                        } );

            $('#features_num_rows', appContext).html(' ' + featureTable.data().length);
        };

        var showRegionsTable = function showRegionsTable(json) {
            $('#regions_num_rows', appContext).empty();
            if ( ! (json && json.obj) || json.obj.status !== 'success') {
                $('#error', appContext).html(errorMessage('Invalid response from server!'));
                return;
            }

            var filename = 'Protein_Domain_Regions_for_';
            if (json.obj.result[0]) {
                filename += json.obj.result[0].protein_id;
            } else {
                filename += $('#protein_id', appContext).val();
            }
            $('#protein_domain_regions_results', appContext).html(templates.regionsTable(json.obj));
            var regionsTable = $('#protein_domain_regions_results table', appContext).DataTable( {'lengthMenu': [10, 25, 50, 100],
                                                                                         'language': {
                                                                                             'emptyTable': 'No protein domain regions available for this protein id.'
                                                                                         },
                                                                                         'buttons': [{'extend': 'csv', 'title': filename},
                                                                                                     {'extend': 'excel', 'title': filename},
                                                                                                     'colvis'],
                                                                                         'order' : [[ 1, 'asc' ]],
                                                                                         'colReorder': true,
                                                                                         'dom': '<"row"<"col-sm-6"l><"col-sm-6"f<"button-row"B>>><"row"<"col-sm-12"tr>><"row"<"col-sm-5"i><"col-sm-7"p>>'
                                                                                        } );

            $('#regions_num_rows', appContext).html(' ' + regionsTable.data().length);
        };

        var showPublicationTable = function showPublicationTable(json) {
            $('#pub_num_rows', appContext).empty();
            if ( ! (json && json.obj) || json.obj.status !== 'success') {
                $('#error', appContext).html(errorMessage('Invalid response from server!'));
                return;
            }

            var filename = 'Publications_for_';
            if (json.obj.result[0]) {
                filename += json.obj.result[0].protein_id;
            } else {
                filename += $('#protein_id', appContext).val();
            }
            $('#protein_pub_results', appContext).html(templates.publicationTable(json.obj));
            var pubTable = $('#protein_pub_results table', appContext).DataTable( {'lengthMenu': [10, 25, 50, 100],
                                                                                'language': {
                                                                                    'emptyTable': 'No Publication data available for this protein id.'
                                                                                },
                                                                                'buttons': [{'extend': 'csv', 'title': filename},
                                                                                            {'extend': 'excel', 'title': filename},
                                                                                            'colvis'],
                                                                                'order' : [[ 1, 'desc' ]],
                                                                                'colReorder': true,
                                                                                'dom': '<"row"<"col-sm-6"l><"col-sm-6"f<"button-row"B>>><"row"<"col-sm-12"tr>><"row"<"col-sm-5"i><"col-sm-7"p>>'
                                                                               } );

            $('#pub_num_rows', appContext).html(' ' + pubTable.data().length);
        };

        // controls the clear button
        $('#clearButton', appContext).on('click', function () {
            // clear the gene field
            $('#protein_id', appContext).val('');
            $('#datasource1', appContext).prop('checked', true);
            // clear the error section
            $('#error', appContext).empty();
            // clear the number of result rows from the tabs
            $('#progress_region', appContext).addClass('hidden');
            $('#summary_ident', appContext).empty();
            $('#comments_num_rows', appContext).empty();
            $('#features_num_rows', appContext).empty();
            $('#regions_num_rows', appContext).empty();
            $('#pub_num_rows', appContext).empty();
            // clear the tables
            $('#protein_summary_results', appContext).html('<h4>' + default_tab_text + '</h4>');
            $('#protein_comments_results', appContext).html('<h4>' + default_tab_text + '</h4>');
            $('#protein_features_results', appContext).html('<h4>' + default_tab_text + '</h4>');
            $('#protein_domain_regions_results', appContext).html('<h4>' + default_tab_text + '</h4>');
            $('#protein_pub_results', appContext).html('<h4>' + default_tab_text + '</h4>');
            // select the about tab
            $('a[href="#about"]', appContext).tab('show');
        });


        // search form
        $('#proteinSearch', appContext).submit(function(event) {
            event.preventDefault();

            // Reset error div
            $('#error', appContext).empty();

            // disable form
            disableForm();

            // Inserts loading text, will be replaced by table
            $('#protein_summary_results', appContext).html('<h4>Loading summary information...</h4>');
            $('#protein_comments_results', appContext).html('<h4>Loading comments...</h4>');
            $('#protein_features_results', appContext).html('<h4>Loading features...</h4>');
            $('#protein_domain_regions_results', appContext).html('<h4>Loading protein domain regions...</h4>');
            $('#protein_pub_results', appContext).html('<h4>Loading publications...</h4>');

            // start progress bar and tab spinners
            $('#progress_region', appContext).removeClass('hidden');
            $('#summary_ident', appContext).html('<i class="fa fa-refresh fa-spin"></i>');
            $('#comments_num_rows', appContext).html('<i class="fa fa-refresh fa-spin"></i>');
            $('#features_num_rows', appContext).html('<i class="fa fa-refresh fa-spin"></i>');
            $('#regions_num_rows', appContext).html('<i class="fa fa-refresh fa-spin"></i>');
            $('#pub_num_rows', appContext).html('<i class="fa fa-refresh fa-spin"></i>');

            var source = $('input[name=datasource]:checked').val();

            var params = {
                identifier: this.protein_id.value,
                source: source
            };

            // Calls ADAMA adapter to retrieve protein summary data
            Agave.api.adama.search({
                'namespace': 'araport',
                'service': 'protein_summary_by_identifier_v0.1',
                'queryParams': params
            }, showSummaryTable, showErrorMessage);

            // Calls ADAMA adapter to retrieve protein curated comments
            Agave.api.adama.search({
                'namespace': 'araport',
                'service': 'curated_comments_by_protein_identifier_v0.1',
                'queryParams': params
            }, showCommentsTable, showErrorMessage);

            // Calls ADAMA adapter to retrieve protein features
            Agave.api.adama.search({
                'namespace': 'araport',
                'service': 'protein_features_by_identifier_v0.1',
                'queryParams': params
            }, showFeaturesTable, showErrorMessage);

            // Calls ADAMA adapter to retrieve protein domain regions
            Agave.api.adama.search({
                'namespace': 'araport',
                'service': 'protein_domain_regions_by_identifier_v0.1',
                'queryParams': params
            }, showRegionsTable, showErrorMessage);

            // Calls ADAMA adapter to retrieve protein publications
            Agave.api.adama.search({
                'namespace': 'araport',
                'service': 'publications_by_protein_identifier_v0.1',
                'queryParams': params
            }, showPublicationTable, showErrorMessage);
        });
    });
})(window, jQuery, _, moment);
